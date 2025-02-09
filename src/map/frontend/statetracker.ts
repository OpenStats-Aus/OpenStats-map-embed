import { UserMapManager } from './usermapmanager';

export class StateManager {
    private options: StateOptions;

    constructor(private mapManager: UserMapManager, private map: L.Map, options: StateOptions) {
        this.options = {
            ...{
                pushHistory: true,
                restoreFromHistory: true
            },
            ...options
        }
    }

    public init() {
        if (this.options.restoreFromHistory) {
            this.restoreFromHistory();
        }
        if (this.options.pushHistory) {
            this.map.on('moveend', () => {
                this.updateHistory();
            });
            this.map.on('geostatisticchange', () => {
                this.updateHistory();
            });
            this.map.on('overlaychange', () => {
                this.updateHistory();
            });
            this.map.on('toggleautoselect', () => {
                this.updateHistory();
            });
        }
    }

    private updateHistory() {
        var lat = this.map.getCenter().lat
        var lng = this.map.getCenter().lng
        var latRounded = Math.round(lat * 10000) / 10000;
        var lngRounded = Math.round(lng * 10000) / 10000;
        var zoom = this.map.getZoom();
        var geo = this.mapManager.usingAutoSelect() ? "auto" : this.mapManager.getSelectedOverlay()?.getId();
        var stat = this.mapManager.getSelectedGeoStatistic()?.getId();
        
        var defaultParameters = this.options.defaultParameters;

        var allDefault = defaultParameters && lat === defaultParameters.lat && lng === defaultParameters.lng &&
            zoom === defaultParameters.zoom && geo == defaultParameters.geo &&
            stat === defaultParameters.stat;

        // only write history to URL if we're not using the defaults
        if (!allDefault) {
            window.top?.history.replaceState({}, '', `?lat=${latRounded}&lng=${lngRounded}&zoom=${zoom}&geo=${geo}&stat=${stat}`);
        }
    }

    private restoreFromHistory() {
        var params = new URLSearchParams(window.top?.location.search);
        var lat: number | undefined = parseFloat(params.get('lat') as string);
        var lng: number | undefined = parseFloat(params.get('lng') as string);
        var zoom: number | undefined = parseInt(params.get('zoom') as string);
        var geo: string | null | undefined = params.get('geo');
        var stat: string | null | undefined = params.get('stat');
        if (!stat) {
            stat = params.get('data'); // backwards compatibility
        }

        // use the default parameters if not in history
        if (this.options.defaultParameters) {
            if (isNaN(lat) || lat == null) {
                lat = this.options.defaultParameters.lat;
            }
            if (isNaN(lng) || lat == null) {
                lng = this.options.defaultParameters.lng;
            }
            if (isNaN(zoom) || lat == null) {
                zoom = this.options.defaultParameters.zoom;
            }
            if (!geo) {
                geo = this.options.defaultParameters.geo;
            }
            if (!stat) {
                stat = this.options.defaultParameters.stat;
            }
        }

        // set the map view from history
        if (!(isNaN(lat) || lat == null) && !(isNaN(lng) || lng == null)) {
            this.map.setView([lat, lng], !(isNaN(zoom) || zoom == null) ? zoom : this.map.getZoom(), {animate: false, duration: 0});
        } else if (!(isNaN(zoom) || zoom == null)) {
            this.map.setZoom(zoom);
        }
        if (geo) {
            if (geo === "auto") {
                this.mapManager.setAutoSelect(true);
            } else {
                this.mapManager.selectOverlay(geo);
            }
        }
        if(stat) {
            this.mapManager.selectGeoStatistic(stat);
        }
    }

}

export interface StateOptions {
    pushHistory?: boolean;
    restoreFromHistory?: boolean;
    defaultParameters?: MapParameters;
}

export interface MapParameters {
    lat: number;
    lng: number;
    zoom: number;
    geo: string;
    stat: string;
}