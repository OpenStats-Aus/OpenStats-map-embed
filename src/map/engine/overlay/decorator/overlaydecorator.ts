import { PathOptions, StyleFunction } from 'leaflet';
import { Overlay } from '../overlay';

// decorates layer features
export class OverlayDecorator {

    constructor(private priority: number, private styleFunc: (feature: L.GeoJSON, overlay: Overlay) => PathOptions) {}

    public getPriority(): number {
        return this.priority;
    }
    
    public getStyle(feature: L.GeoJSON, overlay: Overlay): PathOptions {
        return this.styleFunc(feature, overlay);
    }

}