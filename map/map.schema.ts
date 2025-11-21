export interface MapSchema {
    width: number;
    height: number;
    objects: MapObject[];
    layers: MapLayer[]
}

export interface MapLayer {
    type: "tiles" | "objects";
}

export interface TileLayer extends MapLayer {
    tiles: number[];
    width: number;
    height: number;
    class: string;
}

export interface ObjectGroup extends MapLayer {
    objects: Array<MapObject>
}

export interface MapObject {
    id: number,
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    name: string;
    gid: number;
}