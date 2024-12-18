import L from 'leaflet';
import { UserMapManager } from '../usermapmanager';

export class ControlManager {

    constructor(private map: L.Map, private mapManager: UserMapManager) {
        window.addEventListener('resize', event => {
            this.updateControls();
        });
        this.updateControls();

    }

    private updateControls() {
        if (window.matchMedia("(min-width: 768px)").matches) {
            // move control buttons to bottom right
            this.map.zoomControl.setPosition('topleft');
            this.mapManager.getUiManager()?.getSidebar()?.getHamburgerControl()?.setPosition('topleft');
            this.mapManager.getUiManager()?.getSearchControl()?.useDesktopPosition();
        } else {
            // move control buttons to top left
            this.mapManager.getUiManager()?.getSidebar()?.getHamburgerControl()?.setPosition('bottomright');
            this.map.zoomControl.setPosition('bottomright');
            this.mapManager.getUiManager()?.getSearchControl()?.useMobilePosition();
        }
    }

}