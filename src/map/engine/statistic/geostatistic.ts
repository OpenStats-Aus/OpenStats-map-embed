import { PathOptions } from 'leaflet';
import { OverlayDecorator } from '../overlay/decorator/overlaydecorator';
import getTurboColour from '../util/turbocolourmap';

export class GeoStatistic {
    private styler: (ranking: number) => PathOptions;
    private decorator?: OverlayDecorator;
    private values?: any; // key1: the geography type, key2: the geography id, value: the ranking between 0 and 1

    constructor(private map: L.Map, private options: GeoStatisticOptions) {
        this.styler = options.styler ? options.styler : (ranking) => {
            // use a subset of the turbo colour map between 0.45 and 0.95
            // map [0.0, 0.5) to [0.45, 0.625) i.e. green -> yellow
            // map [0.5, 1.0] to [0.625, 0.95] i.e. yellow -> red
            var colour;
            if (ranking < 0.5) {
                // green -> yellow
                colour = getTurboColour(ranking * 2 * (0.625 - 0.45) + 0.45)
            } else {
                // yellow -> red
                colour = getTurboColour((ranking - 0.5) * 2 * (0.95 - 0.625) + 0.625)
            }
            return {
                fillColor: colour,
                fillOpacity: 0.35
            }
        }
        this.init();
    }

    private init() {
        fetch(this.options.dataEndpoint).then(response => response.text()).then(text => {
            this.values = JSON.parse(text);
            this.makeDecorator();
            this.map.fire('geostatisticready', {geoStatistic: this});
        }).catch(error => {
            console.log(`Error loading geostatistic ${this.options.id} ( will retry)`);
            console.log(error);
            this.init(); // retry
        });
    }

    private makeDecorator() {
        this.decorator = new OverlayDecorator(100, (geoJson, overlay) => {
            const feature: any = geoJson.feature;
            const geoType = overlay.getId(); // feature.properties.name; TODO change back
            const geoId = feature.properties.name;
            const ranking = this.values[geoType]?.[geoId] / 100;

            if (ranking === undefined || isNaN(ranking)) {
                return {};
            }
            return this.styler(ranking);
        });
    }

    public isReady() {
        return this.values;
    }

    public getDecorator() {
        return this.decorator;
    }

    public getStyler() {
        return this.styler;
    }

    public getId() {
        return this.options.id;
    }

    public getDisplayName() {
        return this.options.displayName;
    }

}

export interface GeoStatisticOptions {
    id: string
    displayName: string
    dataEndpoint: string
    styler?: (ranking: number) => PathOptions;
}