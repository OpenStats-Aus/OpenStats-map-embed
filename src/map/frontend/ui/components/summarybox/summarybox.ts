import L, { LatLng } from 'leaflet';
import { UserMapManager } from '../../../usermapmanager';
import { Overlay } from '../../../../engine/overlay/overlay';
import './summarybox.css';
import './summary.css';

export class SummaryBox {
    private added: boolean = false;
    private container?: HTMLElement;
    private popup?: L.Popup;
    private content?: HTMLElement;
    private map?: L.Map;

    constructor(private mapManager: UserMapManager, private feature: L.GeoJSON, private overlay: Overlay, private asPopup: boolean = false, private popupLocation?: LatLng) {}

    public init() {
        var container = L.DomUtil.create('div');
        if (this.asPopup && this.popupLocation) {
            this.popup = new L.Popup(this.popupLocation, {
                className: 'leaflet-summarybox',
                content: container,
            });
            this.popup.on('remove', event => {
                this.mapManager.getFeatureSelector()?.unfocusFeature(); // unselect the selected feature when we close the popup
            });
        } else {
            container = L.DomUtil.create('div', 'leaflet-summarybox');
        }
        var titlebar = L.DomUtil.create('div', 'leaflet-summarybox-titlebar', container);
        var titleContainer = L.DomUtil.create('div', 'leaflet-summarybox-title-container', titlebar);

        var title = L.DomUtil.create('h3', 'leaflet-summarybox-title', titleContainer);
        title.innerHTML = (this.feature.feature as any)['properties']?.['name'];

        // add close button in titlebar here
        
        L.DomUtil.create('hr', 'leaflet-summarybox-title-underline', container);

        var contentContainer = L.DomUtil.create('div', 'leaflet-summarybox-content-container', container);
        var content = this.mapManager.getSummaryProvider()?.getSummaryContent(this.feature, this.overlay);
        if (content) {
            contentContainer.appendChild(content);
        }

        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(container, 'contextmenu', L.DomEvent.stopPropagation);

        this.content = content;
        this.container = container;
    }

    public addToMap(map: L.Map) {
        if (this.popup && !this.added) {
            this.map = map;
            this.map.openPopup(this.popup);
            this.added = true;
        } else if (this.container && !this.added) {
            this.map = map;
            this.map?.getContainer().insertBefore(this.container, this.map?.getContainer().firstChild);
            this.added = true;
        }
    }

    public removeFromMap() {
        if (this.popup && this.added && this.map) {
            this.map.closePopup(this.popup);
            this.added = false;
        } else if (this.container && this.added && this.map) {
            this.map.getContainer().removeChild(this.container);
            this.added = false;
        }
    }

    public getContent() {
        return this.content;
    }


}