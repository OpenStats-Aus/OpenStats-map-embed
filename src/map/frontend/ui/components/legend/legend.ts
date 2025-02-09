import L, { PathOptions } from 'leaflet';
import './legend.css';
import { UserMapManager } from '../../../usermapmanager';
import colorString from 'color-string';

export class Legend {
    private gradientBar?: HTMLElement;
    private title?: HTMLElement;

    constructor(private mapManager: UserMapManager, private map: L.Map) {}

    public init() {
        const container = L.DomUtil.create('div', 'leaflet-legend-container');
        const titleContainer = L.DomUtil.create('div', 'leaflet-legend-title-container', container);
        this.title = L.DomUtil.create('h4', 'leaflet-legend-title', titleContainer);

        const legendContentContainer = L.DomUtil.create('div', 'leaflet-legend-content', container);
        const barContainer = L.DomUtil.create('div', 'leaflet-legend-bar-container', legendContentContainer);
        const bar = L.DomUtil.create('div', 'leaflet-legend-bar', barContainer);
        const barLabelContainer = L.DomUtil.create('div', 'leaflet-legend-bar-label-container', barContainer);
        this.gradientBar = L.DomUtil.create('div', 'leaflet-legend-bar-overlay', bar); // the colourful part of the bar

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

        // update the title and gradient when the geo statistic changes
        this.updateLegend();
        this.map.on('geostatisticchange', event => {
            this.updateLegend();
        });
    }

    private updateLegend() {
        const geoStatistic = this.mapManager.getSelectedGeoStatistic();
        if (geoStatistic) {
            if (this.title) {
                this.title.innerHTML = geoStatistic.getDisplayName();
            }
            if (this.gradientBar) {
                this.gradientBar.style.background = this.createGradientStyle(geoStatistic.getStyler());
            }
        }
    }

    private createGradientStyle(styler: (ranking: number) => PathOptions) {
        // build a gradient using the styler function's fill colours
        var gradient = 'linear-gradient(to top';
        for (var i = 0; i <= 100; i++) {
            var ranking = i / 100;
            var style = styler(ranking);
            if (!style) continue;

            var fillColor = style.fillColor;
            var fillOpacity = style.fillOpacity;
            var parsedColour = fillColor ? colorString.get(fillColor) : undefined;

            if (parsedColour) {
                var opacity = parsedColour.value[3] * (fillOpacity === undefined ? 1 : fillOpacity);
                var modelFunction = colorString.to[parsedColour.model]; // returns the "to" function (e.g. colorString.to.rba(...), colorString.to.hsl(...))

                var gradientColourString = modelFunction(parsedColour.value[0], parsedColour.value[1], parsedColour.value[2], opacity);
                gradient += `, ${gradientColourString} ${i}%`;
            }
        }
        gradient += ')';
        return gradient;
    }

}