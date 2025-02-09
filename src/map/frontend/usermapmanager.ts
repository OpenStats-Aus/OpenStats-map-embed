import { PathOptions } from 'leaflet';
import { OverlayDecoratorManager } from '../engine/overlay/decorator/overlaydecoratormanager';
import { Overlay, OverlayOptions } from '../engine/overlay/overlay';
import { OverlayManager } from '../engine/overlay/overlaymanager';
import { GeoStatistic, GeoStatisticOptions } from '../engine/statistic/geostatistic';
import { GeoStatisticManager } from '../engine/statistic/geostatisticmanager';
import { SummaryDataManager } from '../engine/summary/summarydatamanager';
import { AutoGeographySelector, AutoSelectionCriteria } from './autogeographyselector';
import { FeatureSelector } from './featureselector';
import { StateManager, StateOptions } from './statetracker';
import { SummaryProvider } from './summaryprovider';
import { UiManager, UiOptions } from './ui/uimanager';

export class UserMapManager {
    private options: MapOptions;
    private overlayManager: OverlayManager;
    private overlayDecoratorManager: OverlayDecoratorManager;
    private geoStatisticManager: GeoStatisticManager;
    private summaryDataManager?: SummaryDataManager;
    private selectedOverlay?: Overlay;
    private selectedGeoStatistic?: GeoStatistic;
    private autoGeoSelector?: AutoGeographySelector;
    private autoSelect: boolean = false;
    private featureSelector?: FeatureSelector;
    private summaryProvider?: SummaryProvider;
    private uiManager?: UiManager;
    private stateManager?: StateManager;

    constructor(private map: L.Map, options: MapOptions) {
        this.options = options;
        this.overlayManager = new OverlayManager(this.map);
        this.overlayDecoratorManager = new OverlayDecoratorManager(this.map, this.options.baseStyle);
        this.geoStatisticManager = new GeoStatisticManager(this.map);
    }

    public init() {
        this.options.overlays.forEach(this.overlayManager.addOverlay, this.overlayManager);
        this.overlayManager.init();

        this.options.geoStatistics.forEach(this.geoStatisticManager.addGeoStatistic, this.geoStatisticManager);

        this.overlayDecoratorManager.init();

        if (this.options.autoSelectionCriteria) {
            this.autoGeoSelector = new AutoGeographySelector(this, this.options.autoSelectionCriteria);
        }

        // check if the selected geo statistic is ready and add its decorator when so
        this.map.on('geostatisticready', event => {
            if ((event as any).geoStatistic === this.selectedGeoStatistic) {
                const decorator = this.selectedGeoStatistic?.getDecorator();
                if (decorator) {
                    // the selected geo statistic has loaded so we should add its decorator
                    this.overlayDecoratorManager.addDecorator(decorator);
                    if (this.selectedOverlay) {
                        this.overlayDecoratorManager.recalcStyleAll(this.selectedOverlay);
                    }
                }
            }
        });

        if (this.options.summaryDataEndpoint) {
            this.summaryDataManager = new SummaryDataManager(this.options.summaryDataEndpoint)
        }

        this.featureSelector = new FeatureSelector(this, this.options.highlightedStyle);
        
        if (this.options.summaryContentFunc) {
            this.summaryProvider = new SummaryProvider(this, this.options.summaryContentFunc);
        }

        this.uiManager = new UiManager(this.map, this, this.options.ui);
        this.uiManager.init();
        
        this.stateManager = new StateManager(this, this.map, this.options.state);
        this.stateManager.init();

        // select any geo statistic and overlay if none are already selected
        if (!this.selectedGeoStatistic && this.getGeoStatistics().length > 0) {
            this.selectGeoStatistic(this.getGeoStatistics()[0].getId());
        }
        if (!this.selectedOverlay && this.getOverlays().length > 0) {
            if (this.autoGeoSelector) {
                this.setAutoSelect(true);
            } else {
                this.selectOverlay(this.getOverlays()[0].getId());
            }
        }
    }

    public getMap() {
        return this.map;
    }

    public getOverlayManager() {
        return this.overlayManager;
    }

    public getOverlayDecoratorManager() {
        return this.overlayDecoratorManager;
    }

    public getFeatureSelector() {
        return this.featureSelector;
    }

    public getSummaryDataManager() {
        return this.summaryDataManager;
    }

    public getSummaryProvider() {
        return this.summaryProvider;
    }

    public getUiManager() {
        return this.uiManager;
    }

    public selectGeoStatistic(id: string) {
        const geoStatistics = this.getGeoStatistics();
        var found = false;
        for (var i = 0; i < geoStatistics.length; i++) {
            if (geoStatistics[i].getId() == id) {
                const oldGeoStatistic = this.selectedGeoStatistic;
                const oldDecorator = oldGeoStatistic?.getDecorator();
                if (oldDecorator) {
                    // remove the old geo statistic's decorator if it exists
                    this.overlayDecoratorManager.removeDecorator(oldDecorator);
                }

                const newDecorator = geoStatistics[i].getDecorator();
                if (newDecorator) {
                    // add the new decorator if it exists
                    this.overlayDecoratorManager.addDecorator(newDecorator);
                }
                if (this.selectedOverlay) {
                    this.overlayDecoratorManager.recalcStyleAll(this.selectedOverlay);
                }

                this.selectedGeoStatistic = geoStatistics[i];
                found = true;
                this.map.fire('geostatisticchange', {newGeoStatistic: geoStatistics[i], oldGeoStatistic: oldGeoStatistic});
                break;
            }
        }
        if (!found) {
            throw new Error(`Could not find geo statistic with id ${id}.`);
        }
    }

    public getSelectedGeoStatistic(): GeoStatistic | undefined {
        return this.selectedGeoStatistic;
    }

    public getGeoStatistics(): GeoStatistic[] {
        return this.geoStatisticManager.getGeoStatistics();
    }

    public selectOverlay(id: string) {
        const overlays = this.getOverlays();
        var found = false;
        for (var i = 0; i < overlays.length; i++) {
            if (overlays[i].getId() === id) {
                this.selectedOverlay = overlays[i];
                this.overlayManager.setActiveOverlay(overlays[i]);
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error(`Could not find overlay with id ${id}.`);
        }
    }

    public getOverlays(): Overlay[] {
        return this.overlayManager.getAvailableOverlays();
    }

    public getSelectedOverlay(): Overlay | undefined {
        return this.selectedOverlay;
    }

    public hasAutoSelect() {
        return this.autoGeoSelector != null;
    }

    public usingAutoSelect() {
        return this.autoGeoSelector && this.autoSelect;
    }

    public setAutoSelect(autoSelect: boolean) {
        if (this.autoGeoSelector) {
            this.autoSelect = autoSelect;
            this.autoGeoSelector.setEnabled(autoSelect);
            this.map.fire('toggleautoselect', {autoSelect: autoSelect});
        }
    }

}

export interface MapOptions {
    baseStyle?: (feature: L.GeoJSON, overlay: Overlay) => PathOptions;
    highlightedStyle?: (feature: L.GeoJSON, overlay: Overlay) => PathOptions;
    ui: UiOptions;
    summaryContentFunc?: (summaryData: any) => HTMLElement;
    overlays: OverlayOptions[];
    geoStatistics: GeoStatisticOptions[];
    summaryDataEndpoint: string;
    state: StateOptions;
    autoSelectionCriteria: AutoSelectionCriteria;
}