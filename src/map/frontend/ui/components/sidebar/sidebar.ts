import L from 'leaflet';
import { UserMapManager } from '../../../usermapmanager';
import { SidebarV4 } from './sidebarv4';

export class UiSideBar {
    private sidebar?: SidebarV4;
    private aboutElement?: SidebarElement;

    constructor(private map: L.Map, private userMapManager: UserMapManager) {}

    public init() {
        var content = L.DomUtil.create('div');

        // control buttons
        {
            const controlsElement = new SidebarOptionsElement(content, this.userMapManager);
        }

        // about info box
        {
            const aboutElement = new SidebarElement(content);
            aboutElement.title.innerHTML = 'About';
            aboutElement.contentContainer.innerHTML = ``;
            this.aboutElement = aboutElement;
        }

        // other maps
        {
            const otherMapsElement = new SidebarElement(content);
            otherMapsElement.title.innerHTML = 'Other maps';
            L.DomUtil.addClass(otherMapsElement.contentContainer, 'leaflet-sidebar-other-map-container'); // make it a flex container etc

            this.userMapManager.getOtherMapManager().getOtherMaps().forEach(otherMapSettings => {
                const otherMapCard = L.DomUtil.create('a', 'leaflet-sidebar-other-map-card', otherMapsElement.contentContainer);
                otherMapCard.href = this.userMapManager.getOtherMapManager().getUrl(otherMapSettings);
                const imageContainer = L.DomUtil.create('div', 'leaflet-sidebar-other-map-card-image-container', otherMapCard)
                L.DomUtil.create('img', 'leaflet-sidebar-other-map-card-image', imageContainer).src = otherMapSettings.image;
                L.DomUtil.create('h4', 'leaflet-sidebar-other-map-card-title', imageContainer).innerHTML = otherMapSettings.name;
                L.DomUtil.create('p', 'leaflet-sidebar-other-map-card-description', otherMapCard).innerHTML = otherMapSettings.description;
                this.map.on('moveend', event => {
                    otherMapCard.href = this.userMapManager.getOtherMapManager().getUrl(otherMapSettings);
                })
            });
        }

        this.sidebar = new SidebarV4({
            container: 'sidebar',
            content: content,
            title: 'Map'
        });
        this.sidebar.addTo(this.map);

        // start with sidebar open on larger devices
        if (window.matchMedia('(min-width: 768px)').matches) {
            setTimeout(() => {
                this.sidebar?.open();
            }, 500);
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

export class SidebarElement {
    public readonly title: HTMLElement;
    public readonly contentContainer: HTMLElement;

    constructor(container: HTMLElement) {
        const elementContainer = L.DomUtil.create('div', 'leaflet-sidebar-element', container);
        this.title = L.DomUtil.create('h2', 'leaflet-sidebar-element-title', elementContainer);
        this.contentContainer = L.DomUtil.create('div', 'leaflet-sidebar-element-content', elementContainer);
    }

}

class SidebarOptionsElement extends SidebarElement {
    public geographyForm: HTMLFormElement;
    public dataForm: HTMLFormElement;

    constructor(container: HTMLElement, private mapManager: UserMapManager) {
        super(container);
        this.title.innerHTML = "Options";
        L.DomUtil.create('h3', 'leaflet-sidebar-options-header', this.contentContainer).innerHTML = "Geography";
        this.geographyForm = L.DomUtil.create('form', '', this.contentContainer);
        
        L.DomUtil.create('h3', 'leaflet-sidebar-options-header', this.contentContainer).innerHTML = "Data";
        this.dataForm = L.DomUtil.create('form', '', this.contentContainer);

        this.init();
    }

    private init() {
        // auto overlay auto selection button
        {
            const optionContainer = L.DomUtil.create('div', '', this.geographyForm);
            const radio = L.DomUtil.create('input', '', optionContainer);
            radio.type = 'radio';
            radio.id = 'auto';
            radio.name = "geography"
            const label = L.DomUtil.create('label', '', optionContainer);
            label.setAttribute('for', "auto");
            label.innerHTML = "Auto";
            if (this.mapManager.usingAutoSelect()) {
                radio.checked = true;
            }

            L.DomEvent.addListener(radio, 'click', e => {
                if (!this.mapManager.usingAutoSelect()) {
                    this.mapManager.setAutoSelect(true);
                }
            });
        }

        // add overlay radio buttons
        this.mapManager.getOverlays().forEach(overlay => {
            const optionContainer = L.DomUtil.create('div', '', this.geographyForm);
            const radio = L.DomUtil.create('input', '', optionContainer);
            radio.type = 'radio';
            radio.id = overlay.getId();
            radio.name = "geography"
            const label = L.DomUtil.create('label', '', optionContainer);
            label.setAttribute('for', overlay.getId());
            label.innerHTML = overlay.getDisplayName();
            if (this.mapManager.getSelectedOverlay() === overlay) {
                radio.checked = true;
            }

            L.DomEvent.addListener(radio, 'click', e => {
                if (this.mapManager.usingAutoSelect()) {
                    this.mapManager.setAutoSelect(false); // disable auto select when choosing specific geography
                }
                if (this.mapManager.getSelectedOverlay() !== overlay) {
                    this.mapManager.selectOverlay(overlay.getId());
                }
            });
        });

        // add geo statistic radio buttons
        this.mapManager.getGeoStatistics().forEach(stat => {
            const optionContainer = L.DomUtil.create('div', '', this.dataForm);
            const radio = L.DomUtil.create('input', '', optionContainer);
            radio.type = 'radio';
            radio.id = stat.getId();
            radio.name = "geostatistic"
            const label = L.DomUtil.create('label', '', optionContainer);
            label.setAttribute('for', stat.getId());
            label.innerHTML = stat.getDisplayName();
            if (this.mapManager.getSelectedGeoStatistic() === stat) {
                radio.checked = true;
            }

            L.DomEvent.addListener(radio, 'click', e => {
                if (this.mapManager.getSelectedGeoStatistic() !== stat) {
                    this.mapManager.selectGeoStatistic(stat.getId());
                }
            });
        });

        // listen for overlay changes and update the radio buttons and labels accordingly
        this.mapManager.getMap().on('overlaychange', event => {
            for (let i = 0; i < this.geographyForm.elements.length; i++) {
                const element = this.geographyForm.elements[i];
                if (element instanceof HTMLInputElement) {
                    if (this.mapManager.usingAutoSelect() && element.id == "auto") {
                        element.checked = true;
                    }
                    // don't check the radio button if the overlay was selected through auto selection
                    if (!this.mapManager.usingAutoSelect() && element.id == (event as any).newOverlay.getId()) {
                        element.checked = true;
                    }
                    // style the label of the selected overlay, even if it was through auto select
                    element.labels?.forEach(label => {
                        if (element.id == (event as any).newOverlay.getId()) {
                            if (!L.DomUtil.hasClass(label, 'leaflet-sidebar-selected-label')) {
                                L.DomUtil.addClass(label, 'leaflet-sidebar-selected-label');
                            }
                        } else {
                            if (L.DomUtil.hasClass(label, 'leaflet-sidebar-selected-label')) {
                                L.DomUtil.removeClass(label, 'leaflet-sidebar-selected-label');
                            }
                        }
                    });
                }
            }
        });

        // listen for geostatistic changes and update radio buttons and labels accordingly
        this.mapManager.getMap().on('geostatisticchange', event => {
            for (let i = 0; i < this.dataForm.elements.length; i++) {
                const element = this.dataForm.elements[i];
                if (element instanceof HTMLInputElement) {
                    if (element.id == (event as any).newGeoStatistic.getId()) {
                        element.checked = true;
                    }
                    element.labels?.forEach(label => {
                        if (element.id == (event as any).newGeoStatistic.getId()) {
                            if (!L.DomUtil.hasClass(label, 'leaflet-sidebar-selected-label')) {
                                L.DomUtil.addClass(label, 'leaflet-sidebar-selected-label');
                            }
                        } else {
                            if (L.DomUtil.hasClass(label, 'leaflet-sidebar-selected-label')) {
                                L.DomUtil.removeClass(label, 'leaflet-sidebar-selected-label');
                            }
                        }
                    });
                }
            }
        });
    }

}