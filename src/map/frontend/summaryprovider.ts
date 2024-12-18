import { Overlay } from '../engine/overlay/overlay';
import { UserMapManager } from './usermapmanager';

export class SummaryProvider {

    constructor(private mapManager: UserMapManager, private contentFunction: (summaryData: any) => HTMLElement) {}

    public getSummaryContent(feature: L.GeoJSON, overlay: Overlay) {
        var featureName = (feature.feature as any)?.['properties']?.['name'];
        if (!featureName) {
            return undefined;
        }
        return this.contentFunction(this.mapManager.getSummaryDataManager().getSummaryData(featureName, overlay));
    }

}