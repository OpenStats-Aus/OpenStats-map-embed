import L, { LatLng } from 'leaflet';
import { UserMapManager } from '../../../usermapmanager';
import { SummaryBox } from './summarybox';

export class SummaryBoxManager {
    private options: SummaryBoxOptions;
    private activeSummaryBox?: SummaryBox;
    private focusedSummaryBox?: SummaryBox;
    
    constructor(private mapManager: UserMapManager, options?: SummaryBoxOptions) {
        this.options = {
            ...{
                highlightedSummaryBox: {enabled: true},
                focusedSummaryBox: {enabled: true}
            },
            ...options
        }
    }

    public init() {
        if (this.options.highlightedSummaryBox.enabled) {
            this.updateSummaryBox();
            this.mapManager.getMap().on('featurehighlighted', e => this.updateSummaryBox((e as any).clickedLocation));
        }
        if (this.options.focusedSummaryBox.enabled) {
            this.updateFocusedSummaryBox();
            this.mapManager.getMap().on('featurefocused', e => this.updateFocusedSummaryBox((e as any).clickedLocation));
        }
    }

    private updateSummaryBox(clickedLocation?: LatLng) {
        const selectedFeature = this.mapManager.getFeatureSelector()?.getHighlightedFeature();
        const selectedOverlay = this.mapManager.getFeatureSelector()?.getHighlightedFeatureOverlay();


        if (selectedFeature && selectedOverlay) {
            if (this.activeSummaryBox) {
                this.activeSummaryBox.removeFromMap();
            }
            this.activeSummaryBox = new SummaryBox(this.mapManager, selectedFeature, selectedOverlay, false, clickedLocation);
            this.activeSummaryBox.init();
            this.activeSummaryBox.addToMap(this.mapManager.getMap());
        } else {
            // no feature selected, remove summary box
            if (this.activeSummaryBox) {
                this.activeSummaryBox.removeFromMap();
            }
        }
    }

    private updateFocusedSummaryBox(clickedLocation?: LatLng) {
        const selectedFeature = this.mapManager.getFeatureSelector()?.getFocusedFeature();
        const selectedOverlay = this.mapManager.getFeatureSelector()?.getFocusedFeatureOverlay();
        
        if (selectedFeature && selectedOverlay) {
            if (this.focusedSummaryBox) {
                this.focusedSummaryBox.removeFromMap();
            }
            this.focusedSummaryBox = new SummaryBox(this.mapManager, selectedFeature, selectedOverlay, true, clickedLocation);
            this.focusedSummaryBox.init();
            this.focusedSummaryBox.addToMap(this.mapManager.getMap());
        } else {
            // no feature selected, remove summary box
            if (this.focusedSummaryBox) {
                this.focusedSummaryBox.removeFromMap();
            }
        }
    }

}

export interface SummaryBoxOptions {
    highlightedSummaryBox: {
        enabled: boolean;
    }
    focusedSummaryBox: {
        enabled: boolean;
    }
}