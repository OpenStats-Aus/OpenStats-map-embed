import { UserMapManager } from './usermapmanager';

export class HistoryManager {

    constructor(private mapManager: UserMapManager, private map: L.Map, private defaultParameters: any) {}

    public init() {
        this.restoreFromHistory();
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

    private updateHistory() {
        var lat = this.map.getCenter().lat
        var lng = this.map.getCenter().lng
        var latRounded = Math.round(lat * 10000) / 10000;
        var lngRounded = Math.round(lng * 10000) / 10000;
        var zoom = this.map.getZoom();
        var geo = this.mapManager.usingAutoSelect() ? "auto" : this.mapManager.getSelectedOverlay()?.getId();
        var stat = this.mapManager.getSelectedGeoStatistic()?.getId();
        
        var allDefault = lat === this.defaultParameters.lat && lng === this.defaultParameters.lng &&
            zoom === this.defaultParameters.zoom && geo == this.defaultParameters.geo &&
            stat === this.defaultParameters.stat;

        // only write history to URL if we're not using the defaults
        if (!allDefault) {
            window.top?.history.replaceState({}, '', `?lat=${latRounded}&lng=${lngRounded}&zoom=${zoom}&geo=${geo}&stat=${stat}`);
        }
    }

    private restoreFromHistory() {
        var params = new URLSearchParams(window.top?.location.search);
        var lat = parseFloat(params.get('lat') as string);
        var lng = parseFloat(params.get('lng') as string);
        var zoom = parseInt(params.get('zoom') as string);
        var geo = params.get('geo');
        var stat = params.get('stat');
        if (!stat) {
            stat = params.get('data'); // backwards compatibility
        }

        // use the default parameters if not in history
        if (!lat) {
            lat = this.defaultParameters.lat;
        }
        if (!lng) {
            lng = this.defaultParameters.lng;
        }
        if (!zoom) {
            zoom = this.defaultParameters.zoom;
        }
        if (!geo) {
            geo = this.defaultParameters.geo;
        }
        if (!stat) {
            stat = this.defaultParameters.stat;
        }

        // set the map view from history
        if (lat && lng) {
            this.map.setView([lat, lng], zoom ? zoom : this.map.getZoom(), {animate: false, duration: 0});
        }
        if (zoom && !(lat && lng)) {
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