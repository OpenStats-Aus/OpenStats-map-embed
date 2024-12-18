import { LatLonPair } from "../util/latlonpair";
import { GridView } from "../view/gridview";
import L, { LeafletEvent } from "leaflet";
import { OverlayLoader } from "./overlayloader";
import { TiledGeoJsonLayer } from "./tiledgeojsonlayer";


export class Overlay {
    private addedToMap: boolean = false;
    private lods: OverlayLod[];
    private usedLod?: OverlayLod;
    private currentView?: GridView;

    constructor(private map: L.Map, private overlayOptions: OverlayOptions) {
        this.lods = [];
        overlayOptions.lods.forEach(lodOptions => {
            this.lods.push(new OverlayLod(map, lodOptions, this));
        });
        this.selectLod();
    }

    private selectLod() {
        var newLod: OverlayLod | undefined = undefined;
        const zoom = this.map.getZoom() + (L.Browser.retina ? 1 : 0); // adjust zoom for retina displays
        this.lods.forEach(lod => {
            // select the lod with the largest minZoom
            if (zoom >= lod.overlayLodOptions.minZoom && (!newLod || lod.overlayLodOptions.minZoom > newLod.overlayLodOptions.minZoom)) {
                newLod = lod;
            }
        });
        if (newLod !== this.usedLod) {
            const oldLod = this.usedLod;
            this.usedLod = newLod;
            if (this.addedToMap) {
                oldLod?.removeFromMap();
                oldLod?.updateView(undefined);
                (this.usedLod as OverlayLod | undefined)?.addToMap();
                this.currentView = undefined; // force a view update
            }
        }
    }

    public updateView(force: boolean = false) {
        this.selectLod();
        if (!this.usedLod) {
            return;
        }
        const newView = new GridView(this.usedLod?.getResolution(), this.map.getBounds());
        if (force || !this.currentView || !this.currentView.sameAs(newView)) {
            this.currentView = newView;
            this.usedLod?.updateView(newView);
        }
    }

    // add an event listener to each feature
    public onFeature(eventName: string, callable: (geoJson: L.GeoJSON, overlay: Overlay, originalEvent: LeafletEvent) => void) {
        this.lods.forEach(lod => {
            lod.tiledLayer.onFeature(eventName, (geoJson: L.GeoJSON, originalEvent: LeafletEvent) => callable(geoJson, this, originalEvent));
        });
    }

    public addToMap() {
        if (this.addedToMap) {
            throw new Error('Tried to add already active overlay to map');
        }
        this.usedLod?.addToMap();
        this.addedToMap = true;
    }

    public removeFromMap() {
        if (!this.addedToMap) {
            throw new Error('Tried to remove non-active overlay from map');
        }
        this.usedLod?.removeFromMap();
        this.usedLod?.updateView(undefined);
        this.addedToMap = false;
    }

    public getMasterLayer() {
        return this.usedLod?.getMasterLayer();
    }

    public getId() {
        return this.overlayOptions.id;
    }

    public getDisplayName() {
        return this.overlayOptions.displayName;
    }

}

export class OverlayOptions {
    constructor(public readonly id: string, public readonly displayName: string, public readonly lods: OverlayLodOptions[]) { }
}

class OverlayLod {
    private loader: OverlayLoader;
    tiledLayer: TiledGeoJsonLayer;
    private addedToMap: boolean = false;
    private requiredTiles: Set<number> = new Set(); // tiles that we need for the current view and have been requested from the loader
    private viewedTiles: Set<number> = new Set(); // tiles that we need for the current view and have already received from the loader
    private loaderReadyCallback: (() => void) | undefined;

    constructor(private map: L.Map, public readonly overlayLodOptions: OverlayLodOptions, private overlay: Overlay) {
        this.tiledLayer = new TiledGeoJsonLayer(map, overlay); // TODO change to overlaylod
        this.loader = new OverlayLoader(this.overlayLodOptions.tileEndpoint, this.overlayLodOptions.tileListingEndpoint, (coordinates, geoJson) => this.tileReceivedCallback(coordinates, geoJson), () => {
            if (this.loaderReadyCallback) {
                this.loaderReadyCallback();
            }
        });
    }

    public updateView(newView?: GridView) {
        if (!this.loader.isReady()) {
            // re-call updateView with the most recently used newView when the tile loader is ready
            this.loaderReadyCallback = () => this.updateView(newView);
            return;
        }

        // treat undefined view as no view - clear everything
        if (newView === undefined) {
            this.requiredTiles.forEach(key => this.loader.unrequestTile(LatLonPair.fromKey(key)));
            this.requiredTiles.clear();
            this.tiledLayer.clear();
            this.viewedTiles.clear();
            return;
        }

        const previouslyRequiredTiles = this.requiredTiles; // track tiles that were previously required but no longer are
        this.requiredTiles = new Set();
        const previouslyViewedTiles = this.viewedTiles; // track tiles that were previously viewed but no longer are
        this.viewedTiles = new Set();

        for (var deltaLat = 0; deltaLat < newView?.stepsLat; deltaLat++) {
            for (var deltaLon = 0; deltaLon < newView?.stepsLon; deltaLon++) {
                const lat = newView.minLat + deltaLat * newView.resolution;
                const lon = newView.minLon + deltaLon * newView.resolution;
                const latLonPair = new LatLonPair(lat, lon);

                if (!this.loader.hasTile(latLonPair)) {
                    continue;
                }

                this.requiredTiles.add(latLonPair.key());
                // only request the tile if we haven't already
                if (!previouslyRequiredTiles.delete(latLonPair.key())) {
                    this.loader.requestTile(latLonPair);
                }
                if (previouslyViewedTiles.delete(latLonPair.key())) {
                    this.viewedTiles.add(latLonPair.key());
                }
            }
        }
        previouslyRequiredTiles.forEach(key => this.loader.unrequestTile(LatLonPair.fromKey(key))); // unrequest the unneeded tiles
        previouslyViewedTiles.forEach(key => this.tiledLayer.removeTile(LatLonPair.fromKey(key))); // clean up the master layer of any tiles that are no longer viewed
    }

    private tileReceivedCallback(latLonPair: LatLonPair, geoJson: L.GeoJSON) {
        // we might get a callback for tiles that are no longer required, so check here
        if (this.requiredTiles.has(latLonPair.key())) {
            this.tiledLayer.addTile(latLonPair, geoJson); // pass the tile to the master layer for addition
            this.viewedTiles.add(latLonPair.key());
        }
    }

    // add an event listener to each feature
    public onFeature(eventName: string, callable: (geoJson: L.GeoJSON, overlay: Overlay, originalEvent: LeafletEvent) => void) {
        this.tiledLayer.onFeature(eventName, (geoJson: L.GeoJSON, originalEvent: LeafletEvent) => callable(geoJson, this.overlay, originalEvent));
    }

    public addToMap() {
        if (this.addedToMap) {
            throw new Error('Tried to add already active overlay to map');
        }
        this.map.addLayer(this.tiledLayer.getLayer());
        this.addedToMap = true;
    }

    public removeFromMap() {
        if (!this.addedToMap) {
            throw new Error('Tried to remove non-active overlay from map');
        }
        this.map.removeLayer(this.tiledLayer.getLayer());
        this.addedToMap = false;
    }

    public getMasterLayer() {
        return this.tiledLayer.getLayer();
    }

    public getResolution() {
        return this.overlayLodOptions.resolution;
    }
}



export class OverlayLodOptions {
    constructor(public readonly minZoom: number, public readonly resolution: number, public readonly tileEndpoint: string, public readonly tileListingEndpoint: string) { }
}