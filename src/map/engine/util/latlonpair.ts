export class LatLonPair {
    private latitude: number;
    private longitude: number;

    constructor(lat: number, lon: number) {
        this.latitude = lat;
        this.longitude = lon;
    }

    public lat() {
        return this.latitude;
    }

    public lon() {
        return this.longitude;
    }

    public key() {
       return this.latitude * 100000 + this.longitude;
    }

    static fromKey(key: number): LatLonPair {
        const latitude = Math.round(key / 100000);
        const longitude = key - latitude * 100000;

        return new LatLonPair(latitude, longitude);
    }

}