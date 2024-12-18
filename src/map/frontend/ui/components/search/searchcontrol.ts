import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import AbstractProvider from 'leaflet-geosearch/dist/providers/provider';
import 'leaflet-geosearch/assets/css/leaflet.css';
import { Control } from 'leaflet';

export class SearchControl {
    private provider?: AbstractProvider;
    private control?: Control;
    private mobile?: boolean;

    constructor(private map: L.Map) {

    }

    public init() {
        this.provider = new OpenStreetMapProvider({
            params: {
                // params from https://nominatim.org/release-docs/develop/api/Search/#parameters
                'accept-language': 'en',
                countrycodes: 'au',
                layer: 'address',
                dedup: 1
            }
        });
    }

    public useMobilePosition() {
        if (this.mobile) {
            return;
        }
        if (this.control) {
            (this.control as any).clearResults();
            this.map.removeControl(this.control);
        }

        this.control = GeoSearchControl({
            provider: this.provider,
            style: 'bar'
        });

        this.map.addControl(this.control,);
        this.mobile = true;
    }

    public useDesktopPosition() {
        if (this.mobile === false) {
            this.control?.setPosition('topleft') // update the position to keep control buttons in order, but don't re-make the button
            return;
        }
        if (this.control) {
            (this.control as any).clearResults();
            this.map.removeControl(this.control);
        }

        this.control = GeoSearchControl({
            provider: this.provider,
            style: 'button',
            position: 'topleft'
        });

        this.map.addControl(this.control,);
        this.mobile = false;
    }

}