import L from 'leaflet';
import { Overlay } from '../engine/overlay/overlay';
import { UserMapManager } from './usermapmanager';

export class AutoGeographySelector {
    private enabled: boolean = false;

    constructor(private mapManager: UserMapManager, private selectionCriteria: AutoSelectionCriteria) {
        mapManager.getMap().on('zoomend', () => this.update());
    }

    private update() {
        if (!this.enabled) {
            return;
        }
        const zoom = this.mapManager.getMap().getZoom() + (L.Browser.retina ? 1 : 0); // adjust zoom for retina displays
        var selectedOverlay = undefined;
        var selectedMinZoom: any = undefined;
        this.mapManager.getOverlays().forEach(overlay => {
            var minZoom = this.selectionCriteria[overlay.getId()]?.minZoom;
            if (minZoom !== undefined) {
                if (selectedMinZoom && selectedMinZoom > minZoom) {
                    return; // skip if we've found another overlay whose minZoom is greater than this overlay's minZoom
                }
                if (zoom >= minZoom) {
                    selectedOverlay = overlay;
                    selectedMinZoom = minZoom;
                }
            }
        });
        if (selectedOverlay) {
            this.mapManager.selectOverlay((selectedOverlay as Overlay).getId());
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (enabled) {
            this.update();
        }
    }

}

export interface AutoSelectionCriteria {
    [key: string]: {
        minZoom: number;
    };
}