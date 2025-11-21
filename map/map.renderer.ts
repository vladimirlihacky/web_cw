import type { MapObject, MapSchema, ObjectGroup, TileLayer } from "./map.schema";
import type { MapTileset } from "./map.tileset";
import type { MapViewport } from "./map.viewport";

export interface MapRenderer {
    render(schema: MapSchema, viewport: MapViewport): void;
}

export class CanvasMapRenderer implements MapRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tileset: MapTileset;
    private scale = 4;

    constructor(selector: string, tileset: MapTileset) {
        this.canvas = document.querySelector(selector) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.tileset = tileset;
    }
    
    render(schema: MapSchema, viewport: MapViewport): void {
        this.canvas.width = schema.width * this.scale;
        this.canvas.height = schema.height * this.scale;
        this.context.imageSmoothingEnabled = false;
        this.context.scale(this.scale, this.scale)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const layer of schema.layers) {
            if (layer.type === "tiles") {
                this.renderTileLayer(layer as TileLayer)
            }

            if (layer.type === "objects") {
                this.renderObjectGroup(layer as ObjectGroup)
            }
        }
    }

    private renderTileLayer(layer: TileLayer) {
        for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
                const tile = this.tileset.tile(layer.tiles[y * layer.width + x])

                if (!tile) {
                    continue;
                }
                const width = tile[3]
                const height = tile[4]

                this.context.drawImage(...tile, Math.floor(width * x), Math.floor(height * y), width, height)
            }
        }
    }

    private renderObjectGroup(layer: ObjectGroup) {
        for (const obj of layer.objects) {
            const tile = this.tileset.tile(obj.gid);

            if (!tile) {
                continue;
            }
            this.context.imageSmoothingEnabled = false
            this.context.drawImage(...tile, obj.x, Math.ceil( obj.y - tile[4]), tile[3], tile[4])
        }
    }
}