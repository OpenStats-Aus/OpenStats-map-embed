import { LatLng } from 'leaflet';
import { OverlayDecorator } from '../engine/overlay/decorator/overlaydecorator';
import { Overlay } from '../engine/overlay/overlay';
import { UserMapManager } from './usermapmanager';
import { isTouchOnly } from './util/mobileutils';

export class FeatureSelector {
    private focusedFeature?: L.GeoJSON;
    private focusedFeatureOverlay?: Overlay;
    private highlightedFeature?: L.GeoJSON;
    private highlightedFeatureOverlay?: Overlay;
    private decorator: OverlayDecorator;
    private pendingClick: boolean = false;
    private cancelClick: boolean = false;

    constructor(private mapManager: UserMapManager) {
        mapManager.getOverlayManager().onFeature('mouseover', (layer, overlay, event) => {
            if (isTouchOnly()) {
                return;
            }
            this.highlightFeature(layer, overlay, (event as any).latlng);
        });
        mapManager.getOverlayManager().onFeature('mouseout', (layer, overlay, event) => {
            if (isTouchOnly()) {
                return;
            }
            this.highlightFeature(undefined, undefined);
        });
        mapManager.getOverlayManager().onFeature('click', (layer, overlay, event) => {
            if (this.pendingClick) {
                this.cancelClick = true; // another click was pending, so it was a double click
            } else {
                this.pendingClick = true;
                setTimeout(() => {
                    try {
                        if (!this.cancelClick) { // click wasn't cancelled, so it was a single click
                            this.focusFeature(undefined, undefined); // reset in case we had a feature selected before
                            this.focusFeature(layer, overlay, (event as any).latlng);
                        }
                    } finally {
                        this.cancelClick = false;
                        this.pendingClick = false;
                    }
                }, isTouchOnly() ? 300 : 500); // 300 ms delay for touch screens, 500 for desktops
            }
        });

        // highlight the selected features with a black border
        this.decorator = new OverlayDecorator(100, (feature, overlay) => {
            if (!(overlay === this.highlightedFeatureOverlay && this.sameFeature(feature as L.GeoJSON, this.highlightedFeature as L.GeoJSON) ||
            overlay === this.focusedFeatureOverlay && this.sameFeature(feature as L.GeoJSON, this.focusedFeature as L.GeoJSON)
            )) {
                return {};
            }
            return {
                color: 'black',
                opacity: 1,
                weight: 1.5
            }
        });
        mapManager.getOverlayDecoratorManager().addDecorator(this.decorator);
    }

    private highlightFeature(layer?: L.GeoJSON, overlay?: Overlay, clickedLocation?: LatLng) {
        const oldFeature = this.highlightedFeature;
        const oldOverlay = this.highlightedFeatureOverlay;

        this.highlightedFeature = layer;
        this.highlightedFeatureOverlay = overlay;

        if (oldFeature !== this.highlightedFeature) {
            this.mapManager.getMap().fire('featurehighlighted', {feature: layer, overlay: overlay, clickedLocation: clickedLocation});
            if (oldOverlay && oldOverlay !== overlay) {
                this.mapManager.getOverlayDecoratorManager().recalcStyleIf(oldOverlay, testFeature => {
                    return this.sameFeature(testFeature as L.GeoJSON, oldFeature as L.GeoJSON);
                });
            }
            if (overlay) {
                this.mapManager.getOverlayDecoratorManager().recalcStyleIf(overlay, testFeature => {
                    return this.sameFeature(testFeature as L.GeoJSON, this.highlightedFeature as L.GeoJSON);
                });
            }
        }
    }

    private focusFeature(layer?: L.GeoJSON, overlay?: Overlay, clickedLocation?: LatLng) {
        const oldFeature = this.focusedFeature;
        const oldOverlay = this.focusedFeatureOverlay;

        this.focusedFeature = layer;
        this.focusedFeatureOverlay = overlay;

        if (oldFeature !== this.focusedFeature) {
            this.mapManager.getMap().fire('featurefocused', {feature: layer, overlay: overlay, clickedLocation: clickedLocation});
            if (oldOverlay && oldOverlay !== overlay) {
                this.mapManager.getOverlayDecoratorManager().recalcStyleIf(oldOverlay, testFeature => {
                    return this.sameFeature(testFeature as L.GeoJSON, oldFeature as L.GeoJSON);
                });
            }
            if (overlay) {
                this.mapManager.getOverlayDecoratorManager().recalcStyleIf(overlay, testFeature => {
                    return this.sameFeature(testFeature as L.GeoJSON, this.focusedFeature as L.GeoJSON);
                });
            }
        }
    }

    private sameFeature(feature1?: L.GeoJSON, feature2?: L.GeoJSON) {
        if (!feature1 || !feature2) {
            return false;
        }
        return (feature1.feature as any)['properties']?.['name'] == (feature2.feature as any)['properties']?.['name'];
    }

    public unhighlightFeature() {
        this.highlightFeature(undefined, undefined);
    }

    public getHighlightedFeature(): L.GeoJSON | undefined {
        return this.highlightedFeature as L.GeoJSON;
    }

    public getHighlightedFeatureOverlay(): Overlay | undefined {
        return this.highlightedFeatureOverlay;
    }

    public unfocusFeature() {
        this.focusFeature(undefined, undefined);
    }

    public getFocusedFeature(): L.GeoJSON | undefined {
        return this.focusedFeature as L.GeoJSON;
    }

    public getFocusedFeatureOverlay(): Overlay | undefined {
        return this.focusedFeatureOverlay;
    }

}