export namespace Tiled {
    export interface Schema {
        width: number;
        height: number;
        tilewidth: number;
        tileheight: number;

        layers: Layer[];
        tilesets: Tileset[];
    }

    export interface Tileset {
        image: string;
        firstgid: number; 
        columns: number; 
        tilecount: number;
        tileheight: number;
        tilewidth: number;
        imageheight: number;
        imagewidth: number;
    }

    export interface Layer {
        type: string;
        class: string;
        name: string;
    }

    export interface TilesLayer extends Layer {
        data: number[];
        width: number,
        height: number,
    }

    export interface ObjectsLayer extends Layer {
        objects: Object[]
    }

    export interface Object {
        id: number,
        name: string;
        type: string; 
        x: number;
        y: number;
        width: number;
        height: number;
        gid: number;
    }
}