// events/events.manager.ts
var Events;
((Events) => {

  class Manager {
    handlers = new Map;
    globalHandlers = [];
    subscribe(handler) {
      this.globalHandlers.push(handler);
    }
    subscribeTo(name, handler) {
      if (!this.handlers.get(name)) {
        this.handlers.set(name, []);
      }
      this.handlers.get(name).push(handler);
    }
    notify(name, payload) {
      const handlers = this.handlers.get(name) ?? [];
      handlers.forEach((handle) => handle(payload));
      this.globalHandlers.forEach((handle) => handle(name, payload));
    }
  }
  Events.Manager = Manager;
})(Events ||= {});

// controls/controls.manager.ts
class UserIOManager {
  events = new Events.Manager;
  constructor() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }
  handleKeyDown({ code }) {
    const control = this.controlFromCode(code);
    if (control === 0 /* Unknown */)
      return;
    this.events.notify("control.start", { control });
  }
  handleKeyUp({ code }) {
    const control = this.controlFromCode(code);
    if (control === 0 /* Unknown */)
      return;
    this.events.notify("control.stop", { control });
  }
  controlFromCode(code) {
    if (code === "ArrowUp" || code === "KeyW")
      return 1 /* Up */;
    if (code === "ArrowDown" || code === "KeyS")
      return 2 /* Down */;
    if (code === "ArrowLeft" || code === "KeyA")
      return 4 /* Left */;
    if (code === "ArrowRight" || code === "KeyD")
      return 3 /* Right */;
    return 0 /* Unknown */;
  }
}

class ControlsManager {
  userIO = new UserIOManager;
  constructor() {
    this.userIO.events.subscribe((name, { control }) => {
      console.log(name, control);
    });
  }
}

// map/map.adapter.ts
class MapAdapter {
  static async fromURL(url) {
    const response = await fetch(url);
    const tiledSchema = await response.json();
    const schema = {
      ...this.parseMapInfo(tiledSchema),
      ...this.parseLayers(tiledSchema)
    };
    return schema;
  }
  static parseMapInfo(schema) {
    return {
      width: schema.width * schema.tilewidth,
      height: schema.height * schema.tileheight
    };
  }
  static parseLayers(schema) {
    const objects = [];
    const layers = [];
    for (const layer of schema.layers) {
      switch (layer.type) {
        case "tilelayer":
          layers.push(this.parseTilesLayer(layer));
          break;
        case "objectgroup":
          const objectGroup = this.parseObjectGroup(layer);
          layers.push(objectGroup);
          objects.push(...objectGroup.objects);
          break;
        default:
          continue;
      }
    }
    return { objects, layers };
  }
  static parseTilesLayer(layer) {
    return {
      type: "tiles",
      tiles: layer.data,
      class: layer.class
    };
  }
  static parseObjectGroup(layer) {
    return {
      type: "objects",
      objects: layer.objects.map((obj) => ({
        x: obj.x,
        y: obj.y,
        name: obj.name,
        type: obj.type
      }))
    };
  }
}

// index.ts
var controlsManager = new ControlsManager;
console.log(controlsManager);
MapAdapter.fromURL("./tiled/map.json").then(console.log);
