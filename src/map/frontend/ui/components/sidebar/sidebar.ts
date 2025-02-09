import L from 'leaflet';
import { UserMapManager } from '../../../usermapmanager';
import { SidebarV2 } from './sidebarv2/sidebarv2';
import { SidebarOptionsElement } from './elements/optionselement';
import { TextElement } from './elements/textelement';
import { SidebarElement } from './elements/sidebarelement';
import { OtherMapOptions, OtherMapsElement } from './elements/othermapselement';

export class UiSideBar {
    private options: SidebarOptions;
    private sidebar?: SidebarV2;
    private aboutElement?: SidebarElement;

    constructor(private map: L.Map, private userMapManager: UserMapManager, options?: SidebarOptions) {
        this.options = {
            ...{
                title: "Map"
            },
            ...options
        }
    }

    public init() {
        var content = L.DomUtil.create('div');

        // control buttons - only add if there's more than one choice of overlay or geo statistic
        if (this.userMapManager.getGeoStatistics().length > 1 || this.userMapManager.getOverlays().length > 1) {
            new SidebarOptionsElement(content, this.userMapManager);
        }
        // about info box
        if (this.options.aboutContent) {
            this.aboutElement = new TextElement(content, 'About', this.options.aboutContent);
        }
        // other maps
        if (this.options.otherMaps && this.options.otherMaps.length > 0) {
            new OtherMapsElement(content, this.map, this.options.otherMaps);
        }

        this.sidebar = new SidebarV2({
            container: 'sidebar',
            content: content,
            title: this.options.title
        });
        this.sidebar.addTo(this.map);

        // start with sidebar open on larger devices
        if (window.matchMedia('(min-width: 768px)').matches) {
            setTimeout(() => {
                this.sidebar?.open();
            }, 0);
        }
    }

    public setAboutContent(content: string) {
        if (this.aboutElement) {
            this.aboutElement.contentContainer.innerHTML = content;
        }
    }

    public getHamburgerControl(): L.Control | undefined {
        return this.sidebar?._mobileHamburgerControl;
    }

    public setTitle(title: string) {
        (this.sidebar as any)._title.innerHTML = title;
    }

}

export interface SidebarOptions {
    title?: string;
    aboutContent?: string;
    otherMaps?: OtherMapOptions[];
}