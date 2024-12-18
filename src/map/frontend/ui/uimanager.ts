import { UserMapManager } from '../usermapmanager';
import { LegendManager } from './components/legend/legendmanager';
import { SearchControl } from './components/search/searchcontrol';
import { UiSideBar } from './components/sidebar/sidebar';
import { SummaryBoxManager } from './components/summarybox/summaryboxmanager';
import { ControlManager } from './controlmanager';

export class UiManager {
    private sidebar?: UiSideBar;
    private summaryBoxManager?: SummaryBoxManager;
    private searchControl?: SearchControl;
    private legendManager?: LegendManager;
    private controlManager?: ControlManager;

    constructor(private map: L.Map, private mapManager: UserMapManager) {}

    public init() {
        this.sidebar = new UiSideBar(this.map, this.mapManager);
        this.sidebar.init();

        this.summaryBoxManager = new SummaryBoxManager(this.mapManager);
        this.summaryBoxManager.init();

        this.searchControl = new SearchControl(this.map);
        this.searchControl.init();

        this.legendManager = new LegendManager(this.mapManager, this.map);
        this.legendManager.init();

        this.controlManager = new ControlManager(this.map, this.mapManager);
    }

    public getSidebar() {
        return this.sidebar;
    }

    public getSummaryBoxManager() {
        return this.summaryBoxManager;
    }

    public getSearchControl() {
        return this.searchControl;
    }

}