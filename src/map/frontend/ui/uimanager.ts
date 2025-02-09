import { UserMapManager } from '../usermapmanager';
import { LegendManager } from './components/legend/legendmanager';
import { SearchControl } from './components/search/searchcontrol';
import { SidebarOptions, UiSideBar } from './components/sidebar/sidebar';
import { SummaryBoxManager } from './components/summarybox/summaryboxmanager';
import { ControlPositionHandler } from './controlpositionhandler';

export class UiManager {
    private options: UiOptions;
    private sidebar?: UiSideBar;
    private summaryBoxManager?: SummaryBoxManager;
    private searchControl?: SearchControl;
    private legendManager?: LegendManager;

    constructor(private map: L.Map, private mapManager: UserMapManager, uiOptions?: UiOptions) {
        this.options = {
            ...{
                search: {enabled: true},
                legend: {enabled: true},
                sidebar: {enabled: true},
                summaryBox: {enabled: true}
            },
            ...uiOptions
        };
    }

    public init() {
        if (this.options.sidebar.enabled) {
            this.sidebar = new UiSideBar(this.map, this.mapManager, this.options.sidebar.options);
            this.sidebar.init();
        }
        if (this.options.summaryBox.enabled) {
            this.summaryBoxManager = new SummaryBoxManager(this.mapManager);
            this.summaryBoxManager.init();
        }
        if (this.options.search.enabled) {
            this.searchControl = new SearchControl(this.map);
            this.searchControl.init();
        }
        if (this.options.legend.enabled) {
            this.legendManager = new LegendManager(this.mapManager, this.map);
            this.legendManager.init();
        }

        new ControlPositionHandler(this.map, this);
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

export interface UiOptions {
    search: {
        enabled: boolean;
    }
    sidebar: {
        enabled: boolean;
        options?: SidebarOptions;
    }
    legend: {
        enabled: boolean;
    }
    summaryBox: {
        enabled: boolean;
    }
}