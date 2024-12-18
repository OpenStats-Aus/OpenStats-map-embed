import L from 'leaflet';
import './legend.css';
import { UserMapManager } from '../../../usermapmanager';

export class Legend {

    constructor(private mapManager: UserMapManager, private map: L.Map) {}

    public init() {
        const container = L.DomUtil.create('div', 'leaflet-legend-container');
        const titleContainer = L.DomUtil.create('div', 'leaflet-legend-title-container', container);
        const title = L.DomUtil.create('h4', 'leaflet-legend-title', titleContainer);
        title.innerHTML = this.mapManager.getSelectedGeoStatistic()?.getDisplayName() || '';
        this.map.on('geostatisticchange', event => {
            title.innerHTML = this.mapManager.getSelectedGeoStatistic()?.getDisplayName() || '';
        });

        const legendContentContainer = L.DomUtil.create('div', 'leaflet-legend-content', container);

        const barContainer = L.DomUtil.create('div', 'leaflet-legend-bar-container', legendContentContainer);
        const bar = L.DomUtil.create('div', 'leaflet-legend-bar', barContainer);
        const barLabelContainer = L.DomUtil.create('div', 'leaflet-legend-bar-label-container', barContainer);
        L.DomUtil.create('div', 'leaflet-legend-bar-overlay', bar); // the colourful part of the bar

        // add the tick marks and labels
        [
            {class: 'b5', label: '5'},
            {class: 'b25', label: '25'},
            {class: 'm50', label: '50'},
            {class: 't75', label: '75'},
            {class: 't95', label: '95'}
        ].forEach(tick => {
            L.DomUtil.create('div', 'leaflet-legend-bar-tick left ' + tick.class, bar);
            L.DomUtil.create('div', 'leaflet-legend-bar-tick right ' + tick.class, bar);
            L.DomUtil.create('div', 'leaflet-legend-bar-tick-label ' + tick.class, barLabelContainer).innerHTML = tick.label;
        });

        // add the vertical label unit text
        const barUnitContainer = L.DomUtil.create('div', 'leaflet-legend-bar-unit-container', legendContentContainer);
        const barUnitTitle = L.DomUtil.create('div', 'leaflet-legend-bar-unit-title', barUnitContainer);
        barUnitTitle.innerHTML = 'Percentile';

        const legendControl = L.Control.extend({
            onAdd: function(map: L.Map) {
                return container;
            }
        });

        this.map.addControl(new legendControl({
            position: 'bottomleft'
        }));
    }

}