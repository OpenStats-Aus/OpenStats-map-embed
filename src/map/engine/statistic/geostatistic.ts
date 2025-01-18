import { OverlayDecorator } from '../overlay/decorator/overlaydecorator';

export class GeoStatistic {
    private decorator?: OverlayDecorator;
    private values?: any; // key1: the geography type, key2: the geography id, value: the ranking between 0 and 1

    constructor(private map: L.Map, private options: GeoStatisticOptions) {
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

            var hue = (1 - ranking) * 120; // between 0 (red) and 120 (green)
            var lightness = 50 - ranking * 20; // also adjust darkness to make colour blind friendly

            return {
                fillColor: `hsl(${hue}, 100%, ${lightness}%)`,
                fillOpacity: 0.35
            }
        });
    }

    public isReady() {
        return this.values;
    }

    public getDecorator() {
        return this.decorator;
    }

    public getId() {
        return this.options.id;
    }

    public getDisplayName() {
        return this.options.displayName;
    }

}

export class GeoStatisticOptions {

    constructor(public id: string, public displayName: string, public dataEndpoint: string) {}

}