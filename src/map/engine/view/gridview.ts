
/**
 * Defines a grid view of tiles of a given side length over some map bounds.
 */
export class GridView {
    public resolution: number; // the side-lengths of the grid squares
    public minLon: number; // the longitude of the southernmost grid square (up to the resolution)
    public minLat: number; // the latitude of the westernmost grid square (up to the resolution)
    public stepsLon: number; // how many grid squares are in view to the north of the southernmost square
    public stepsLat: number; // how many grid squares are in view to the east of the westernmost square

    constructor(resolution: number, mapBounds: L.LatLngBounds) {
        this.resolution = resolution;
        this.minLon = Math.floor(mapBounds.getWest() / resolution) * resolution;
        this.minLat = Math.floor(mapBounds.getSouth() / resolution) * resolution;
        this.stepsLon = (Math.ceil(mapBounds.getEast() / resolution) * resolution - this.minLon) / resolution;
        this.stepsLat = (Math.ceil(mapBounds.getNorth() / resolution) * resolution - this.minLat) / resolution;
    }

    public sameAs(otherView: GridView): boolean {
        return (otherView.resolution === this.resolution
            && otherView.minLon === this.minLon
            && otherView.minLat === this.minLat
            && otherView.stepsLon === this.stepsLon
            && otherView.stepsLat === this.stepsLat);
    }

}
