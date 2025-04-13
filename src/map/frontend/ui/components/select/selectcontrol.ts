import L from 'leaflet';
import { UserMapManager } from '../../../usermapmanager';
import './selectcontrol.css'

export class SelectControl {
    private title?: HTMLElement;

    constructor(private mapManager: UserMapManager, private map: L.Map) {}

    public init() {
        const container = L.DomUtil.create('div', 'leaflet-select-container');
        //const titleContainer = L.DomUtil.create('div', 'leaflet-legend-title-container', container);
        //this.title = L.DomUtil.create('h4', 'leaflet-legend-title', titleContainer);

        const selectElement = L.DomUtil.create('select', 'leaflet-select', container);
        
        this.mapManager.getGeoStatistics().forEach(statistic => {
            const optionElement = L.DomUtil.create('option', 'leaflet-select-option', selectElement);
            optionElement.value = statistic.getId();
            optionElement.innerHTML = statistic.getDisplayName();
        });
        
        // default to currently selected geostatistic
        const selectedGeoStatistic = this.mapManager.getSelectedGeoStatistic();
        if (selectedGeoStatistic) {
            selectElement.value = selectedGeoStatistic.getId();
        }

        // update map to selected geostatistic
        selectElement.addEventListener('change', () => {
            this.mapManager.selectGeoStatistic(selectElement.value);
        });

        // sync in case the geostatistic changes through other means
        this.mapManager.getMap().on('geostatisticchange', () => {
            const selectedGeoStatistic = this.mapManager.getSelectedGeoStatistic();
            if (selectedGeoStatistic) {
                selectElement.value = selectedGeoStatistic.getId();
            }
        });


        const selectControl = L.Control.extend({
            onAdd: function(map: L.Map) {
                return container;
            }
        });

        this.map.addControl(new selectControl({
            position: 'topleft'
        }));
    }


}