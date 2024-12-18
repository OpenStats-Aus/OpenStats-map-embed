import L, { DomUtil } from 'leaflet';
import './leaflet-sidebar.css'

export class SidebarV4 extends L.Control {
    pane = undefined;
    options = {
        autopan: false,
        closeButton: true,
        container: null,
        position: 'left'
    };

    constructor(options) {
        super();
        this.options = Object.assign(this.options, options);
        L.setOptions(this, options);
    }

    onAdd(map) {
        var container = this._container

        // use the container given via options.
        if (!container) {
            container = this._container || typeof this.options.container === 'string'
            ? L.DomUtil.get(this.options.container)
            : this.options.container;
        }

        // if no container was specified or not found, create it and apply an ID
        if (!container) {
            container = L.DomUtil.create('div', 'leaflet-sidebar collapsed');
            if (typeof this.options.container === 'string')
                container.id = this.options.container;
        }
        this._container = container;

        var titlebar = this._titlebar;
        if (!titlebar) {
            titlebar = L.DomUtil.create('div', 'leaflet-sidebar-titlebar', container);
            this._title = L.DomUtil.create('h1', 'leaflet-sidebar-title collapsed', titlebar);
            this._title.innerHTML = this.options.title;

            this._titlebar = titlebar;
        }

        // Find paneContainer in DOM & store reference
        this._paneContainer = container.querySelector('div.leaflet-sidebar-content');

        // If none is found, create it
        if (this._paneContainer === null)
            this._paneContainer = L.DomUtil.create('div', 'leaflet-sidebar-content', container);

        var buttonClick = () => {
            if (L.DomUtil.hasClass(container, 'collapsed')) {
                this.open();
            } else {
                this.close();
                L.DomUtil.removeClass(this.pane, 'active');
            }
        };

        if (!this._closeButton) {
            this._closeButton = L.DomUtil.create('a', 'leaflet-sidebar-close', this._titlebar);
            this._closeButton.role = "button";
            //this._closeButton.href = "#";
            this._closeButton.title = "Toggle menu";
            this.updateCloseButton();
            L.DomEvent.addListener(this._closeButton, 'click', buttonClick);
        }

        var mobileHamburger = this._mobileHamburger;
        if (!mobileHamburger) {
            var mobileHamburgerContainer = L.DomUtil.create('div', 'leaflet-sidebar-hamburger-mobile-container');
            mobileHamburger = L.DomUtil.create('a', 'leaflet-sidebar-hamburger-mobile', mobileHamburgerContainer);
            mobileHamburger.role = "button";
            //mobileHamburger.href = "#";
            mobileHamburger.title = "Toggle menu";
            mobileHamburger['aria-disabled'] = false;
            var hamburger = L.DomUtil.create('div', 'leaflet-sidebar-hamburger', mobileHamburger);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', hamburger);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', hamburger);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', hamburger);
            var hamburgerControl = L.Control.extend({
                onAdd: function(map) {
                    return mobileHamburgerContainer;
                }
            })
            this._mobileHamburgerControl = new hamburgerControl({
                position: 'topleft'
            });
            map.addControl(this._mobileHamburgerControl);
            this._mobileHamburger = mobileHamburger;
            L.DomEvent.addListener(mobileHamburger, 'click', buttonClick);
        }

        this.pane = L.DomUtil.create('div', 'leaflet-sidebar-pane', this._paneContainer);
        
        this.pane.appendChild(this.options.content);

        // leaflet moves the returned container to the right place in the DOM
        return container;
    }

    updateCloseButton() {
        var button = undefined;
        if (!L.DomUtil.hasClass(this._container, 'collapsed')) {
            L.DomUtil.empty(this._closeButton);
            button = L.DomUtil.create('div', 'leaflet-sidebar-close-button', this._closeButton);
            L.DomEvent.on(button, 'contextmenu', L.DomEvent.stopPropagation);
        } else {
            L.DomUtil.empty(this._closeButton);
            button = L.DomUtil.create('div', 'leaflet-sidebar-hamburger', this._closeButton);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', button);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', button);
            L.DomUtil.create('div', 'leaflet-sidebar-hamburger-line', button);
            L.DomUtil.addClass(this._closeButton, 'hamburger');
        }
        // stop clicks from propagating to the map
        L.DomUtil.removeClass(this._closeButton, 'hamburger');
        L.DomEvent.disableScrollPropagation(button);
        L.DomEvent.disableClickPropagation(button);
    }

    onRemove(map) {
        return this;
    }

    addTo(map) {
        this.onRemove();
        this._map = map;

        this._container = this.onAdd(map);

        L.DomUtil.addClass(this._container, 'leaflet-control');
        L.DomUtil.addClass(this._container, 'leaflet-sidebar-' + this.getPosition());
        if (L.Browser.touch)
            L.DomUtil.addClass(this._container, 'leaflet-touch');

        // when adding to the map container, we should stop event propagation
        L.DomEvent.disableScrollPropagation(this._container);
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.on(this._container, 'contextmenu', L.DomEvent.stopPropagation);

        L.DomEvent.disableScrollPropagation(this._mobileHamburger);
        L.DomEvent.disableClickPropagation(this._mobileHamburger);
        L.DomEvent.on(this._mobileHamburger, 'contextmenu', L.DomEvent.stopPropagation);

        //L.DomEvent.disableScrollPropagation(this._titlebar);
        //L.DomEvent.disableClickPropagation(this._titlebar);
        //L.DomEvent.on(this._titlebar, 'contextmenu', L.DomEvent.stopPropagation);

        map._container.insertBefore(this._container, map._container.firstChild);

        return this;
    }

    removeFrom(map) {
        console.warn('removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon.');
        this._map._container.removeChild(this._container);
        this.onRemove(map);

        return this;
    }

    open() {
        if (!L.DomUtil.hasClass(this.pane, 'active')) {
            L.DomUtil.addClass(this.pane, 'active');
        }

        // Open sidebar if it's closed
        if (L.DomUtil.hasClass(this._container, 'collapsed')) {
            L.DomUtil.removeClass(this._container, 'collapsed');
            L.DomUtil.removeClass(this._title, 'collapsed');
            if (this.options.autopan) this._panMap('open');
        }
        this.updateCloseButton();

        return this;
    }

    close() {
        if (L.DomUtil.hasClass(this.pane, 'active')) {
            L.DomUtil.removeClass(this.pane, 'active');
        }

        // close sidebar, if it's opened
        if (!L.DomUtil.hasClass(this._container, 'collapsed')) {
            L.DomUtil.addClass(this._container, 'collapsed');
            L.DomUtil.addClass(this._title, 'collapsed');
            if (this.options.autopan) this._panMap('close');
        }

        this.updateCloseButton();

        return this;
    }

    onCloseClick() {
        this.close();
    }

    _panMap(openClose) {
        var panWidth = Number.parseInt(L.DomUtil.getStyle(this._container, 'max-width')) / 2;
        if (
            openClose === 'open' && this.options.position === 'left' ||
            openClose === 'close' && this.options.position === 'right'
        ) panWidth *= -1;
        this._map.panBy([panWidth, 0], { duration: 0.5 });
    }
}
