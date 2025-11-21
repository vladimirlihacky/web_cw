import type { MapLayer, MapObject, MapSchema, ObjectGroup, TileLayer } from "./map.schema";
import { MapTileset, type SpriteSheet } from "./map.tileset";
import type { Tiled } from "./tiled.schema";

export class MapAdapter {
    static async fromURL(url: string) {
        const response = await fetch(url);
        const tiledSchema: Tiled.Schema = await response.json();
        const schema: MapSchema = {
            ...this.parseMapInfo(tiledSchema),
            ...this.parseLayers(tiledSchema)
        }
        const spriteSheets = this.parseSpriteSheets(tiledSchema)
        const tileset = new MapTileset(spriteSheets);

        await tileset.init()

        return { schema, tileset };
    }

    static parseSpriteSheets(schema: Tiled.Schema): SpriteSheet[] {
        return schema.tilesets.map(sheet => ({
            source: sheet.image,
            height: sheet.imageheight,
            width: sheet.imagewidth,
            tileHeight: sheet.tileheight,
            tileWidth: sheet.tilewidth,
            firstgid: sheet.firstgid,
            tilesCount: sheet.tilecount,
        }))
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

        return { 
            objects, 
            layers,
        }
    }

    static parseTilesLayer(layer: Tiled.TilesLayer): TileLayer {
        return {
            type: "tiles",
            tiles: layer.data,
            class: layer.class,
            width: layer.width,
            height: layer.height,
        }
    }

    static parseObjectGroup(layer: Tiled.ObjectsLayer): ObjectGroup {
        return {
            type: "objects",
            objects: layer.objects.map(obj => ({
                id: obj.id,
                x: Math.floor(obj.x), 
                y: Math.floor(obj.y), 
                name: obj.name,
                type: obj.type,
                gid: obj.gid,
                width: obj.width,
                height: obj.height,
            }))
        }
    }
}