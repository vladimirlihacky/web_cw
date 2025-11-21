import { BaseEntity } from "../entities/base.entity";
import { Vector } from "../physics/physics.base";
import type { PhysicalObject } from "../physics/physics.interfaces";
import type { MapRenderer } from "./map.renderer";
import type { MapSchema, ObjectGroup, TileLayer } from "./map.schema";
import type { MapTileset } from "./map.tileset";

export class MapManager {
    entities: (BaseEntity | PhysicalObject)[] = [];

    constructor(
        private renderer: MapRenderer,
        private schema: MapSchema,
        private tileset: MapTileset,
    ) {
        this.bindEntities();
        this.render();
    }

    render() {
        this.renderer.render(this.schema, {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        })

        requestAnimationFrame(this.render.bind(this));
    }

    bindEntities() {
        const entities = this.schema.objects.map(BaseEntity.fromMapObject);
        this.entities = entities;
        this.schema.objects = entities;

        for (const layer of this.schema.layers) {
            if (layer.type == "objects") {
                const objgroup = layer as ObjectGroup;
                for (let i = 0; i < objgroup.objects.length; i++) {
                    objgroup.objects[i] = entities.find(({ id }) => id === objgroup.objects[i].id)!;
                }
            }

            if(layer.type == "tiles") {
                const tiles = layer as TileLayer;
                if(tiles.class === "obstacles") {
                    for(let y = 0; y < tiles.height; y++) {
                        for(let x = 0; x < tiles.width; x++) {
                            if(tiles.tiles[y * tiles.width + x] !== 0) {
                                const [
                                    a,
                                    b,
                                    c,
                                    w,
                                    h
                                ] = this.tileset.tile(tiles.tiles[y * tiles.width + x]) as number[];

                                const obstacle = {
                                    x: x * w,
                                    y: (y) * h + 1.5 * h,
                                    width: w,
                                    height: h,
                                    mass: Infinity,
                                    velocity: new Vector(0, 0),
                                    isStatic: true,
                                }

                                this.entities.push(obstacle)
                                console.log(obstacle)
                            }
                        }
                    }
                }
            }
        }
    }
}