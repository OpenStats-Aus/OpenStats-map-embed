import { OverlayDecorator } from './map/engine/overlay/decorator/overlaydecorator';
import { OverlayDecoratorManager } from './map/engine/overlay/decorator/overlaydecoratormanager';
import { OverlayManager } from './map/engine/overlay/overlaymanager';
import { GeoStatisticManager } from './map/engine/statistic/geostatisticmanager';
import { SummaryDataManager } from './map/engine/summary/summarydatamanager';
import { OtherMapManager } from './map/frontend/othermapmanager';
import { UserMapManager } from './map/frontend/usermapmanager';
import L from 'leaflet';

var mapContainer = document.getElementById('map');

if (mapContainer == null) {
    const shadowHost = document.getElementById('map-host');
    if (shadowHost?.shadowRoot) {
        mapContainer = shadowHost?.shadowRoot?.querySelector('#map');
    }
}

if (mapContainer) {
    const map = L.map(mapContainer, {
        preferCanvas: true
    }).setView([-33.8688, 151.2093], 13);
    (window as any).map = map;
    window.dispatchEvent(new Event('map-init'));

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        detectRetina: true
    }).addTo(map);

    //new MapInitialiser().init(map);
} else {
    throw new Error("Could not find map container.");
}

(window as any).OverlayManager = OverlayManager;
(window as any).OverlayDecorator = OverlayDecorator;
(window as any).OverlayDecoratorManager = OverlayDecoratorManager;
(window as any).GeoStatisticManager = GeoStatisticManager;
(window as any).SummaryDataManager = SummaryDataManager;
(window as any).UserMapManager = UserMapManager;
(window as any).OtherMapManager = OtherMapManager;