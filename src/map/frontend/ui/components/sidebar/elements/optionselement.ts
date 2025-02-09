import L from 'leaflet';
import { UserMapManager } from '../../../../usermapmanager';
import { SidebarElement } from './sidebarelement';

export class SidebarOptionsElement extends SidebarElement {
    public geographyForm?: HTMLFormElement;
    public dataForm?: HTMLFormElement;

    constructor(container: HTMLElement, private mapManager: UserMapManager) {
        super(container);
        this.title.innerHTML = "Options";
        if (mapManager.getOverlays().length > 1) {
            L.DomUtil.create('h3', 'leaflet-sidebar-options-header', this.contentContainer).innerHTML = "Geography";
            this.geographyForm = L.DomUtil.create('form', '', this.contentContainer);
        }
        if (mapManager.getGeoStatistics().length > 1) {
            L.DomUtil.create('h3', 'leaflet-sidebar-options-header', this.contentContainer).innerHTML = "Data";
            this.dataForm = L.DomUtil.create('form', '', this.contentContainer);
        }
        this.init();
    }

    private init() {
        // auto overlay auto selection button
        if (this.geographyForm && this.mapManager.hasAutoSelect()) {
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

        if (this.geographyForm) {
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
        }
        if (this.dataForm) {
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
        }
        if (this.geographyForm) {
            // listen for overlay changes and update the radio buttons and labels accordingly
            this.mapManager.getMap().on('overlaychange', event => {
                for (let i = 0; i < this.geographyForm!.elements.length; i++) {
                    const element = this.geographyForm!.elements[i];
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
        }

        if (this.dataForm) {
            // listen for geostatistic changes and update radio buttons and labels accordingly
            this.mapManager.getMap().on('geostatisticchange', event => {
                for (let i = 0; i < this.dataForm!.elements.length; i++) {
                    const element = this.dataForm!.elements[i];
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

}