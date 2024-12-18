import { UserMapManager } from './usermapmanager';

export class OtherMapManager {
    private otherMaps: OtherMapSettings[] = [];

    constructor(private map: L.Map) {}

    public getUrl(settings: OtherMapSettings) {
        return settings.urlTemplate
            .replace('{lat}', this.map.getCenter().lat.toString())
            .replace('{lng}', this.map.getCenter().lng.toString())
            .replace('{zoom}', this.map.getZoom().toString());
    }

    public addOtherMap(settings: OtherMapSettings) {
        this.otherMaps.push(settings);
    }

    public getOtherMaps() {
        return this.otherMaps;
    }

}

export class OtherMapSettings {

    constructor(public readonly name: string, public readonly description: string, public readonly urlTemplate: string, public readonly image: string) {}

}