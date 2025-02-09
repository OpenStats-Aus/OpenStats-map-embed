import L from 'leaflet';

export class SidebarElement {
    public readonly title: HTMLElement;
    public readonly contentContainer: HTMLElement;

    constructor(container: HTMLElement) {
        const elementContainer = L.DomUtil.create('div', 'leaflet-sidebar-element', container);
        this.title = L.DomUtil.create('h2', 'leaflet-sidebar-element-title', elementContainer);
        this.contentContainer = L.DomUtil.create('div', 'leaflet-sidebar-element-content', elementContainer);
    }

}