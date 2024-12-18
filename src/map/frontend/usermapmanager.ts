import { OverlayDecoratorManager } from '../engine/overlay/decorator/overlaydecoratormanager';
import { Overlay } from '../engine/overlay/overlay';
import { OverlayManager } from '../engine/overlay/overlaymanager';
import { GeoStatistic } from '../engine/statistic/geostatistic';
import { GeoStatisticManager } from '../engine/statistic/geostatisticmanager';
import { SummaryDataManager } from '../engine/summary/summarydatamanager';
import { AutoGeographySelector } from './autogeographyselector';
import { FeatureSelector } from './featureselector';
import { HistoryManager } from './historymanager';
import { OtherMapManager } from './othermapmanager';
import { SummaryProvider } from './summaryprovider';
import { UiManager } from './ui/uimanager';

export class UserMapManager {
    private selectedOverlay?: Overlay;
    private selectedGeoStatistic?: GeoStatistic;
    private autoGeoSelector?: AutoGeographySelector;
    private autoSelect: boolean = false;
    private featureSelector?: FeatureSelector;
    private summaryProvider?: SummaryProvider;
    private uiManager?: UiManager;
    private historyManager?: HistoryManager;

    constructor(private map: L.Map, private overlayManager: OverlayManager, private overlayDecoratorManager: OverlayDecoratorManager,
        private geoStatisticManager: GeoStatisticManager, private summaryDataManager: SummaryDataManager, private otherMapManager: OtherMapManager,
        private summaryContentFunc: (summaryData: any) => HTMLElement, private defaultParameters: any, private autoSelectionCriteria: any
    ) {
        this.init();
    }

    private init() {
        this.autoGeoSelector = new AutoGeographySelector(this, this.autoSelectionCriteria);

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

        this.featureSelector = new FeatureSelector(this);
        this.summaryProvider = new SummaryProvider(this, this.summaryContentFunc);

        this.uiManager = new UiManager(this.map, this);
        this.uiManager.init();
        
        this.historyManager = new HistoryManager(this, this.map, this.defaultParameters);
        this.historyManager.init();
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

    public getOtherMapManager() {
        return this.otherMapManager;
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