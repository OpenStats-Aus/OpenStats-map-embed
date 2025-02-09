import L from 'leaflet';
import { SidebarElement } from './sidebarelement';

export class OtherMapsElement extends SidebarElement {
    
    constructor(container: HTMLElement, map: L.Map, otherMaps: OtherMapOptions[]) {
        super(container)
        const otherMapManager = new OtherMapManager(map);
        otherMaps.forEach(otherMapManager.addOtherMap, otherMapManager);

        this.title.innerHTML = 'Other maps';
        L.DomUtil.addClass(this.contentContainer, 'leaflet-sidebar-other-map-container'); // make it a flex container etc

        otherMapManager.getOtherMaps().forEach(otherMapSettings => {
            const otherMapCard = L.DomUtil.create('a', 'leaflet-sidebar-other-map-card', this.contentContainer);
            otherMapCard.href = otherMapManager.getUrl(otherMapSettings);
            const imageContainer = L.DomUtil.create('div', 'leaflet-sidebar-other-map-card-image-container', otherMapCard)
            L.DomUtil.create('img', 'leaflet-sidebar-other-map-card-image', imageContainer).src = otherMapSettings.image;
            L.DomUtil.create('h4', 'leaflet-sidebar-other-map-card-title', imageContainer).innerHTML = otherMapSettings.name;
            L.DomUtil.create('p', 'leaflet-sidebar-other-map-card-description', otherMapCard).innerHTML = otherMapSettings.description;
            map.on('moveend', event => {
                otherMapCard.href = otherMapManager.getUrl(otherMapSettings);
            })
        });
    }

}

class OtherMapManager {
    private otherMaps: OtherMapOptions[] = [];

    constructor(private map: L.Map) {}

    public getUrl(settings: OtherMapOptions) {
        return settings.urlTemplate
            .replace('{lat}', this.map.getCenter().lat.toString())
            .replace('{lng}', this.map.getCenter().lng.toString())
            .replace('{zoom}', this.map.getZoom().toString());
    }

    public addOtherMap(settings: OtherMapOptions) {
        this.otherMaps.push(settings);
    }

    public getOtherMaps() {
        return this.otherMaps;
    }

}

export interface OtherMapOptions {
    name: string;
    description: string;
    urlTemplate: string;
    image: string;
}