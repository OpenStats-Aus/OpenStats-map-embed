import { GeoStatistic, GeoStatisticOptions } from './geostatistic';

export class GeoStatisticManager {
    private geoStatistics: GeoStatistic[] = [];

    constructor(private map: L.Map) {}

    public addGeoStatistic(options: GeoStatisticOptions) {
        const newGeoStatistics = [];
        this.geoStatistics.forEach(oldGeoStatistic => {
            if (oldGeoStatistic.getId() !== options.id) {
                newGeoStatistics.push(oldGeoStatistic);
            }
        });
        newGeoStatistics.push(new GeoStatistic(this.map, options));
        this.geoStatistics = newGeoStatistics;
    }

    public getGeoStatistics() {
        return this.geoStatistics;
    }

}