import { UserMapManager } from '../../../usermapmanager';
import { Legend } from './legend';

export class LegendManager {

    constructor(private mapManager: UserMapManager, private map: L.Map) {}

    public init() {
        new Legend(this.mapManager, this.map).init();
    }

}