export namespace Tiled {
    export interface Schema {
        width: number;
        height: number;
        tilewidth: number;
        tileheight: number;

        layers: Layer[];
    }

    export interface Layer {
        type: string;
        class: string;
        name: string;
    }

    export interface TilesLayer extends Layer {
        data: number[];
    }

    export interface ObjectsLayer extends Layer {
        objects: Object[]
    }

    export interface Object {
        name: string;
        type: string; 
        x: number;
        y: number;
    }
}