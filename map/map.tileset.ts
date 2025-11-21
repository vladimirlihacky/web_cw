export interface SpriteSheet {
    source: string;
    width: number;
    height: number;
    tilesCount: number;
    tileHeight: number;
    tileWidth: number;
    firstgid: number;
}

export interface LoadedSpriteSheet extends SpriteSheet {
    image: HTMLImageElement;
}

export class MapTileset {
    initialized = false;
    spriteSheets: LoadedSpriteSheet[] = [];

    constructor(
        spriteSheets: SpriteSheet[],
    ) {
        this.spriteSheets = spriteSheets
            .map(sheet => ({
                ...sheet,
                image: new Image(),
            }))
            .sort((a, b) => a.firstgid - b.firstgid);
    }

    async init() {
        const loaders = this.spriteSheets.map((sheet) => new Promise((resolve) => {
            sheet.image.src = sheet.source;
            sheet.image.onload = resolve;
        }))

        await Promise.all(loaders)
    }

    public tile(id: number): [HTMLImageElement, number, number, number, number] | null {
        const sheet = this.spriteSheets.findLast((sheet) => sheet.firstgid <= id);

        if (!sheet) {
            return null;
        }

        const localId = id - sheet.firstgid;
        
        if (localId >= sheet.tilesCount) {
            return null;
        }

        const tilesPerRow = Math.floor(sheet.width / sheet.tileWidth);
        const tileX = (localId % tilesPerRow) * sheet.tileWidth;
        const tileY = Math.floor(localId / tilesPerRow) * sheet.tileHeight;

        return [
            sheet.image,
            Math.floor(tileX),
            Math.floor(tileY),
            Math.floor(sheet.tileWidth),
            Math.floor(sheet.tileHeight),
        ];
    }
}