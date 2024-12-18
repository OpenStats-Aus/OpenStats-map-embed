import { Overlay } from '../overlay';
import { OverlayDecorator } from './overlaydecorator';

export class OverlayDecoratorManager {
    private activeDecorators: OverlayDecorator[] = [];

    constructor(private map: L.Map, private baseDecorator?: OverlayDecorator) {
        map.on('preoverlayfeatureadd', e => this.onPreFeatureAdd(e));
    }

    public addDecorator(decorator: OverlayDecorator) {
        const newActiveDecorators = [];
        var added = false;
        this.activeDecorators.forEach(oldDecorator => {
            if (!added && oldDecorator.getPriority() > decorator.getPriority()) {
                newActiveDecorators.push(decorator); // add the new decorator here - before the first decorator with a greater priority
                added = true; // note down that we've added the new decorator so we don't add it again
            }
            newActiveDecorators.push(oldDecorator);
        });
        if (!added) {
            newActiveDecorators.push(decorator); // in case it wasn't added in the forEach loop
        }
        this.activeDecorators = newActiveDecorators;
    }

    public removeDecorator(decorator: OverlayDecorator) {
        const newActiveDecorators: OverlayDecorator[] = [];
        this.activeDecorators.forEach(oldDecorator => {
            if (oldDecorator !== decorator) {
                newActiveDecorators.push(oldDecorator);
            }
        });
        this.activeDecorators = newActiveDecorators;
    }

    private setStyle(feature: L.GeoJSON, overlay: Overlay) {
        // combine the styles of the base decorator and all the active decorators
        // the last decorator in the active decorate list will override any duplicated settings
        const pathOptions = Object.assign(
            {},
            this.baseDecorator === undefined ? {} : this.baseDecorator.getStyle(feature, overlay),
            ...this.activeDecorators.map(decorator => decorator.getStyle(feature, overlay))
        );
        feature.setStyle(pathOptions);
    }

    private onPreFeatureAdd(event: any) {
        this.setStyle(event.feature, event.overlay);
    }

    public recalcStyle(feature: L.GeoJSON, overlay: Overlay) {
        this.setStyle(feature, overlay);
    }

    public recalcStyleAll(overlay: Overlay) {
        overlay.getMasterLayer()?.eachLayer(layer => {
            this.recalcStyle(layer as L.GeoJSON, overlay);
        });
    }

    public recalcStyleIf(overlay: Overlay, predicate: (feature: L.GeoJSON) => boolean) {
        overlay.getMasterLayer()?.eachLayer(layer => {
            if (predicate(layer as L.GeoJSON)) {
                this.recalcStyle(layer as L.GeoJSON, overlay);
            }
        });
    }

}