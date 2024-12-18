import L, { control, geoJSON } from 'leaflet';
import { LatLonPair } from '../util/latlonpair';

export class OverlayLoader {
    private endpoint: string;
    private tileListingEndpoint: string;
    private tileRequestCallback: (latLonPair: LatLonPair, geoJson: L.GeoJSON) => void;
    private loaderReadyCallback?: () => void;
    private availableTiles?: Set<number>;
    private tileCachePromises: Map<number, Promise<any>> = new Map();
    private tileCache: Map<number, L.GeoJSON> = new Map();
    private controllerCache: Map<number, AbortController> = new Map();

    constructor(endpoint: string, tileListingEndpoint: string, tileRequestCallback: (latLonPair: LatLonPair, geoJson: L.GeoJSON) => void, loaderReadyCallback?: () => void) {
        this.endpoint = endpoint;
        this.tileListingEndpoint = tileListingEndpoint;
        this.tileRequestCallback = tileRequestCallback;
        this.loaderReadyCallback = loaderReadyCallback;
        this.fetchAvailableTiles();
    }

    public isReady() {
        return this.availableTiles;
    }

    public hasTile(coordinates: LatLonPair) {
        return this.availableTiles?.has(coordinates.key());
    }

    private fetchAvailableTiles() {
        return fetch(this.tileListingEndpoint).then(data => data.text()).then(text => {
            const availableTiles = new Set<number>();
            text.split('\n').forEach(line => {
                if (line.length === 0) {
                    return;
                }
                const lineParts = line.split(',');
                const latLongPair = new LatLonPair(Number.parseInt(lineParts[0]), Number.parseInt(lineParts[1]));
                availableTiles.add(latLongPair.key());
            });
            this.availableTiles = availableTiles;
            if (this.loaderReadyCallback) {
                this.loaderReadyCallback();
            }
            return availableTiles;
        }).catch(error => {
            console.log(`Error loading tile listing ${this.tileListingEndpoint} ( will retry)`);
            console.log(error);
            this.fetchAvailableTiles(); // retry
        });
    }
 
    public requestTile(coordinates: LatLonPair) {
        var tileData = this.tileCache.get(coordinates.key());
        if (tileData !== undefined) {
            this.tileRequestCallback(coordinates, tileData);
            return;
        }
        var tileRequest = this.tileCachePromises.get(coordinates.key());
        if (tileRequest !== undefined) {
            return; // already requested and the callback will be called when complete
        }
        if (this.controllerCache.has(coordinates.key())) {
            // we only get here if we already requested the tile, but the available tiles list hasn't loaded yet
            return;
        }
        var controller = new AbortController(); // will allow us to cancel the fetch later if needed
        this.controllerCache.set(coordinates.key(), controller);

        if (!this.availableTiles?.has(coordinates.key())) {
            return;
        }
        const fetchUrl = this.endpoint.replace('{lat}', coordinates.lat().toString()).replace('{lon}', coordinates.lon().toString());
        tileRequest = fetch(fetchUrl, { signal: controller.signal }).then(response => response.text()).then(text => {
            const geoJson = L.geoJSON(JSON.parse(text));
            this.tileCache.set(coordinates.key(), geoJson);
            if (controller.signal.aborted) {
                return; // stop here in case it was aborted after the fetch completed
            }
            this.tileRequestCallback(coordinates, geoJson);
        }).catch(error => {
            console.log(`Error loading tile lat: ${coordinates.lat()} lng: ${coordinates.lon()}`);
            console.log(error);

            // clear the caches if not aborted
            if (controller.signal.aborted) {
                return;
            }
            this.controllerCache.delete(coordinates.key());
            this.tileCachePromises.delete(coordinates.key());
        }).finally(() => this.controllerCache.delete(coordinates.key())); // fetch completed, so don't need to keep the controller
        this.tileCachePromises.set(coordinates.key(), tileRequest);
    }

    public unrequestTile(coordinates: LatLonPair) {
        const controller = this.controllerCache.get(coordinates.key());
        if (controller !== undefined) {
            controller.abort('view-moved');
            this.controllerCache.delete(coordinates.key());
            this.tileCachePromises.delete(coordinates.key());
        }
    }


}