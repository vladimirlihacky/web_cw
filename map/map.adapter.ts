import type { MapLayer, MapObject, MapSchema, ObjectGroup, TileLayer } from "./map.schema";
import type { Tiled } from "./tiled.schema";

export class MapAdapter {
    static async fromURL(url: string): Promise<MapSchema> {
        const response = await fetch(url);
        const tiledSchema: Tiled.Schema = await response.json();
        const schema: MapSchema = {
            ...this.parseMapInfo(tiledSchema),
            ...this.parseLayers(tiledSchema)
        }

        return schema;
    }

    static parseMapInfo(schema: Tiled.Schema) {
        return {
            width: schema.width * schema.tilewidth,
            height: schema.height * schema.tileheight,
        }
    }

    static parseLayers(schema: Tiled.Schema) {
        const objects: MapObject[] = [];
        const layers: MapLayer[] = [];

        for(const layer of schema.layers) {
            switch(layer.type) {
                case "tilelayer":
                    layers.push(this.parseTilesLayer(layer as Tiled.TilesLayer))
                    break;

                case "objectgroup":
                    const objectGroup = this.parseObjectGroup(layer as Tiled.ObjectsLayer)
                    layers.push(objectGroup)
                    objects.push(...objectGroup.objects)
                    break;

                default: continue;
            }
        }

        return { objects, layers }
    }

    static parseTilesLayer(layer: Tiled.TilesLayer): TileLayer {
        return {
            type: "tiles",
            tiles: layer.data,
            class: layer.class,
        }
    }

    static parseObjectGroup(layer: Tiled.ObjectsLayer): ObjectGroup {
        return {
            type: "objects",
            objects: layer.objects.map(obj => ({
                x: obj.x, 
                y: obj.y, 
                name: obj.name,
                type: obj.type
            }))
        }
    }
}