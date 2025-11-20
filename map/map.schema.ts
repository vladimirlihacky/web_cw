export interface MapSchema {
    width: number;
    height: number;
    objects: MapObject[];
    layers: MapLayer[]
}

export interface MapLayer {
    type: string;
}

export interface TileLayer extends MapLayer {
    tiles: number[];
    class: string;
}

export interface ObjectGroup extends MapLayer {
    objects: Array<MapObject>
}

export interface MapObject {
    x: number;
    y: number;
    type: string;
    name: string;
}