import { Controls } from "./controls/controls.list";
import { ControlsManager } from "./controls/controls.manager";
import { BaseEntity } from "./entities/base.entity";
import { MapAdapter } from "./map/map.adapter";
import { MapManager } from "./map/map.manager";
import { CanvasMapRenderer } from "./map/map.renderer";
import { Vector } from "./physics/physics.base";
import { PhysicsManager } from "./physics/physics.manager";

async function init() {
    const { schema, tileset } = await MapAdapter.fromURL("./tiled/map.json")
    const mapRenderer = new CanvasMapRenderer("#canvas", tileset);
    const controlsManager = new ControlsManager();
    const mapManager = new MapManager(mapRenderer, schema, tileset);
    const physicsManager = new PhysicsManager();

    const hero = mapManager.entities.find(({ type }) => type === "hero")!;

    controlsManager.bindEntity(hero as BaseEntity);
    
    for(const entity of mapManager.entities) {
        physicsManager.register(entity);
    }

    setInterval(() => {
        physicsManager.update(16);
    }, 16)
}

init()