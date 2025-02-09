import L from 'leaflet';
import { UiManager } from './uimanager';

export class ControlPositionHandler {

    constructor(private map: L.Map, private uiManager: UiManager) {
        window.addEventListener('resize', event => {
            this.updateControls();
        });
        this.updateControls();
    }

    private updateControls() {
        if (window.matchMedia("(min-width: 768px)").matches) {
            // move control buttons to bottom right
            this.map.zoomControl.setPosition('topleft');
            this.uiManager.getSidebar()?.getHamburgerControl()?.setPosition('topleft');
            this.uiManager.getSearchControl()?.useDesktopPosition();
        } else {
            // move control buttons to top left
            this.uiManager?.getSidebar()?.getHamburgerControl()?.setPosition('bottomright');
            this.map.zoomControl.setPosition('bottomright');
            this.uiManager?.getSearchControl()?.useMobilePosition();
        }
    }

}