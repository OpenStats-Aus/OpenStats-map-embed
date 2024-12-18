import L, { LeafletEvent } from "leaflet";
import { LatLonPair } from "../util/latlonpair";
import { Overlay } from './overlay';

/**
 * Merges together several geoJSON 'tiles' into one layer, and dynamically updates.
 */
export class TiledGeoJsonLayer {
    private masterLayer: L.GeoJSON = L.geoJSON();
    private addedTiles: Map<number, L.GeoJSON> = new Map();
    private featureHolders: Map<number, Set<number>> = new Map(); // tracks which tiles need which features (multiple tiles can share the same feature)
    private usedLayers: Map<number, L.Layer> = new Map(); // tracks the actual layer that represents each GeoJSON feature added to the master layer
    private eventListeners: any = {};

    constructor(private map: L.Map, private overlay: Overlay) {}

    public getLayer(): L.GeoJSON {
        return this.masterLayer;
    }

    public clear() {
        this.masterLayer.clearLayers();
        this.addedTiles.clear();
        this.featureHolders.clear();
        this.usedLayers.clear();
    }

    public addTile(latLonPair: LatLonPair, geoJson: L.GeoJSON) {
        this.addedTiles.set(latLonPair.key(), geoJson);
        
        // expecting a feature collection, so loop over the features (eachLayer) and try adding to master layer
        // TODO: maybe change later so each tile is a layer to avoid unnecessary re-rendering
        geoJson.eachLayer(layer => {
            const feature: any = (layer as L.GeoJSON).feature; // this is the raw GeoJSON data
            const fid = feature['properties']['fid']; // the unique identifier of the feature

            var holders = this.featureHolders.get(fid);
            if (holders === undefined) {
                holders = new Set();
                this.featureHolders.set(fid, holders);
            }
            // only add to master layer if it's not been added from any other tile
            if (holders.size === 0) {
                this.map.fire('preoverlayfeatureadd', { feature: layer, overlay: this.overlay });

                this.masterLayer.addLayer(layer);
                this.usedLayers.set(fid, layer);

                // add event listeners to the added feature
                this.addEventListeners(layer as L.GeoJSON);

                this.map.fire('overlayfeatureadd', { feature: layer, overlay: this.overlay });
            }
            holders.add(latLonPair.key());
        });

    }

    public removeTile(latLonPair: LatLonPair) {
        const geoJson = this.addedTiles.get(latLonPair.key());
        if (geoJson === undefined) {
            return;
        }
        this.addedTiles.delete(latLonPair.key());

        geoJson.eachLayer(layer => {
            const feature: any = (layer as L.GeoJSON).feature; // the feature is the raw GeoJSON data
            const fid = feature['properties']['fid']; // the unique identifier of the feature

            const holders = this.featureHolders.get(fid);
            if (holders === undefined) {
                throw new Error(`Missing feature holders for ${fid} in ${latLonPair} on remove.`);
            }
            holders.delete(latLonPair.key());
            if (holders.size > 0) {
                return; // another tile needs this feature, so don't remove it
            }
            this.featureHolders.delete(fid);

            const usedLayer = this.usedLayers.get(fid); // the actual layer added to the master layer (can differ from feature above if it came from another tile)
            if (usedLayer === undefined) {
                throw new Error(`Missing used layer for ${fid} in ${latLonPair} on remove.`);
            }
            this.usedLayers.delete(fid);
            this.masterLayer.removeLayer(usedLayer);

            // remove event listeners from the removed feature
            this.removeEventListeners(usedLayer as L.GeoJSON);

            this.map.fire('overlayfeatureremove', { feature: usedLayer, overlay: this.overlay });
        });
    }

    // add an event listener to each feature
    public onFeature(eventName: string, callable: (geoJson: L.GeoJSON, originalEvent: LeafletEvent) => void) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = new Set();
        }
        (this.eventListeners[eventName] as Set<any>).add(callable);
        this.masterLayer.eachLayer(layer => this.addEventListeners(layer as L.GeoJSON));
    }

    private addEventListeners(layer: L.GeoJSON) {
        const events = Object.keys(this.eventListeners);
        events.forEach(event => {
            const eventListeners = this.eventListeners[event] as Set<any>;
            eventListeners.forEach(listener => {
                if (layer.hasEventListeners(event)) { // fix this later, currently means we can't add multiple listeners for the same event
                    return;
                }
                layer.on(event, event => listener(layer, event))
            });
        });
    }

    private removeEventListeners(layer: L.GeoJSON) {
        const events = Object.keys(this.eventListeners);
        events.forEach(event => {
            layer.off(event);
        });
    }
}
