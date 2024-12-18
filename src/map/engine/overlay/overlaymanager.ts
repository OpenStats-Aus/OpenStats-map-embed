import { LeafletEvent } from 'leaflet';
import { Overlay, OverlayOptions } from "./overlay";

export class OverlayManager {
    private activeOverlay?: Overlay;
    private overlays: Overlay[] = [];
    private eventListeners: any = {};

    constructor(private map: L.Map) {
        this.map.on('moveend', event => this.updateView());
    }

    private updateView(force: boolean = false) {
        if (this.activeOverlay === undefined) {
            return;
        }
        this.activeOverlay.updateView(force);
    }

    public addOverlay(overlayOptions: OverlayOptions) {
        this.overlays.push(new Overlay(this.map, overlayOptions));
    }

    public getAvailableOverlays(): Overlay[] {
        return this.overlays;
    }

    public setActiveOverlay(overlay: Overlay) {
        if (this.activeOverlay === overlay) {
            return;
        }
        const previousOverlay = this.activeOverlay;
        if (previousOverlay !== undefined) {
            previousOverlay.removeFromMap();
        }
        this.activeOverlay = overlay;
        this.updateView(true); // force a view update when changing overlay
        this.activeOverlay.addToMap();

        this.map.fire("overlaychange", { newOverlay: this.activeOverlay, previousOverlay: previousOverlay })
    }

    // add an event listener to each feature
    public onFeature(eventName: string, callable: (geoJson: L.GeoJSON, overlay: Overlay, originalEvent: LeafletEvent) => void) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = new Set();
        }
        (this.eventListeners[eventName] as Set<any>).add(callable);
        this.overlays.forEach(overlay => overlay.onFeature(eventName, callable));
    }

}