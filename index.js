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
  activeControls = new Set;
  boundEntity = null;
  constructor() {
    this.userIO.events.subscribeTo("control.start", (data) => {
      this.activeControls.add(data.control);
      this.updateMovement();
    });
    this.userIO.events.subscribeTo("control.stop", (data) => {
      this.activeControls.delete(data.control);
      this.updateMovement();
    });
  }
  bindEntity(entity) {
    this.boundEntity = entity;
  }
  updateMovement() {
    if (!this.boundEntity)
      return;
    let x = 0;
    let y = 0;
    if (this.activeControls.has(4 /* Left */))
      x -= 1;
    if (this.activeControls.has(3 /* Right */))
      x += 1;
    if (this.activeControls.has(1 /* Up */))
      y -= 1;
    if (this.activeControls.has(2 /* Down */))
      y += 1;
    this.boundEntity.move(x, y);
  }
}

// map/map.tileset.ts
class MapTileset {
  initialized = false;
  spriteSheets = [];
  constructor(spriteSheets) {
    this.spriteSheets = spriteSheets.map((sheet) => ({
      ...sheet,
      image: new Image
    })).sort((a, b) => a.firstgid - b.firstgid);
  }
  async init() {
    const loaders = this.spriteSheets.map((sheet) => new Promise((resolve) => {
      sheet.image.src = sheet.source;
      sheet.image.onload = resolve;
    }));
    await Promise.all(loaders);
  }
  tile(id) {
    const sheet = this.spriteSheets.findLast((sheet2) => sheet2.firstgid <= id);
    if (!sheet) {
      return null;
    }
    const localId = id - sheet.firstgid;
    if (localId >= sheet.tilesCount) {
      return null;
    }
    const tilesPerRow = Math.floor(sheet.width / sheet.tileWidth);
    const tileX = localId % tilesPerRow * sheet.tileWidth;
    const tileY = Math.floor(localId / tilesPerRow) * sheet.tileHeight;
    return [
      sheet.image,
      Math.floor(tileX),
      Math.floor(tileY),
      Math.floor(sheet.tileWidth),
      Math.floor(sheet.tileHeight)
    ];
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
    const spriteSheets = this.parseSpriteSheets(tiledSchema);
    const tileset = new MapTileset(spriteSheets);
    await tileset.init();
    return { schema, tileset };
  }
  static parseSpriteSheets(schema) {
    return schema.tilesets.map((sheet) => ({
      source: sheet.image,
      height: sheet.imageheight,
      width: sheet.imagewidth,
      tileHeight: sheet.tileheight,
      tileWidth: sheet.tilewidth,
      firstgid: sheet.firstgid,
      tilesCount: sheet.tilecount
    }));
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
    return {
      objects,
      layers
    };
  }
  static parseTilesLayer(layer) {
    return {
      type: "tiles",
      tiles: layer.data,
      class: layer.class,
      width: layer.width,
      height: layer.height
    };
  }
  static parseObjectGroup(layer) {
    return {
      type: "objects",
      objects: layer.objects.map((obj) => ({
        id: obj.id,
        x: Math.floor(obj.x),
        y: Math.floor(obj.y),
        name: obj.name,
        type: obj.type,
        gid: obj.gid,
        width: obj.width,
        height: obj.height
      }))
    };
  }
}

// physics/physics.base.ts
class Vector {
  components = [];
  get x() {
    return this.components[0];
  }
  set x(value) {
    this.components[0] = value;
  }
  get y() {
    return this.components[1];
  }
  set y(value) {
    this.components[1] = value;
  }
  get z() {
    return this.components[2];
  }
  set z(value) {
    this.components[2] = value;
  }
  constructor(...components) {
    this.components = components;
  }
  add(other) {
    return new Vector(...this.components.map((c, i) => c + (other.components[i] ?? 0)));
  }
  multiplyScalar(scalar) {
    return new Vector(...this.components.map((c) => c * scalar));
  }
  divideScalar(scalar) {
    if (scalar === 0)
      throw new Error("Division by zero");
    return new Vector(...this.components.map((c) => c / scalar));
  }
  multiplyElementwise(other) {
    return new Vector(...this.components.map((c, i) => c * (other.components[i] ?? 1)));
  }
  dot(other) {
    return this.components.reduce((sum, c, i) => sum + c * (other.components[i] ?? 0), 0);
  }
  normalize() {
    const magnitude = this.magnitude();
    if (magnitude === 0)
      throw new Error("Cannot normalize zero vector");
    return this.divideScalar(magnitude);
  }
  magnitude() {
    return Math.sqrt(this.components.reduce((sum, c) => sum + c * c, 0));
  }
  negate() {
    return this.multiplyScalar(-1);
  }
  subtract(other) {
    return new Vector(...this.components.map((c, i) => c - (other.components[i] ?? 0)));
  }
  equals(other, epsilon = 0.0000000001) {
    return this.components.every((c, i) => Math.abs(c - (other.components[i] ?? 0)) < epsilon);
  }
  clone() {
    return new Vector(...this.components);
  }
}

// entities/base.entity.ts
class BaseEntity {
  id = 0;
  type = "";
  gid = 0;
  name = "";
  x = 0;
  y = 0;
  height = 0;
  width = 0;
  mass = 1;
  velocity = new Vector(0, 0);
  isStatic = false;
  move(x, y) {
    let direction = new Vector(x, y);
    if (!direction.equals(new Vector(0, 0))) {
      direction = direction.normalize();
    }
    this.velocity = direction.multiplyScalar(60);
  }
  static fromMapObject(obj) {
    const entity = Object.assign(new BaseEntity, obj);
    return entity;
  }
  onTouch(entity) {
    console.log(entity);
  }
}

// map/map.manager.ts
class MapManager {
  renderer;
  schema;
  tileset;
  entities = [];
  constructor(renderer, schema, tileset) {
    this.renderer = renderer;
    this.schema = schema;
    this.tileset = tileset;
    this.bindEntities();
    this.render();
  }
  render() {
    this.renderer.render(this.schema, {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    requestAnimationFrame(this.render.bind(this));
  }
  bindEntities() {
    const entities = this.schema.objects.map(BaseEntity.fromMapObject);
    this.entities = entities;
    this.schema.objects = entities;
    for (const layer of this.schema.layers) {
      if (layer.type == "objects") {
        const objgroup = layer;
        for (let i = 0;i < objgroup.objects.length; i++) {
          objgroup.objects[i] = entities.find(({ id }) => id === objgroup.objects[i].id);
        }
      }
      if (layer.type == "tiles") {
        const tiles = layer;
        if (tiles.class === "obstacles") {
          for (let y = 0;y < tiles.height; y++) {
            for (let x = 0;x < tiles.width; x++) {
              if (tiles.tiles[y * tiles.width + x] !== 0) {
                const [
                  a,
                  b,
                  c,
                  w,
                  h
                ] = this.tileset.tile(tiles.tiles[y * tiles.width + x]);
                const obstacle = {
                  x: x * w,
                  y: y * h + 1.5 * h,
                  width: w,
                  height: h,
                  mass: Infinity,
                  velocity: new Vector(0, 0),
                  isStatic: true
                };
                this.entities.push(obstacle);
                console.log(obstacle);
              }
            }
          }
        }
      }
    }
  }
}

// map/map.renderer.ts
class CanvasMapRenderer {
  canvas;
  context;
  tileset;
  scale = 4;
  constructor(selector, tileset) {
    this.canvas = document.querySelector(selector);
    this.context = this.canvas.getContext("2d");
    this.tileset = tileset;
  }
  render(schema, viewport) {
    this.canvas.width = schema.width * this.scale;
    this.canvas.height = schema.height * this.scale;
    this.context.imageSmoothingEnabled = false;
    this.context.scale(this.scale, this.scale);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const layer of schema.layers) {
      if (layer.type === "tiles") {
        this.renderTileLayer(layer);
      }
      if (layer.type === "objects") {
        this.renderObjectGroup(layer);
      }
    }
  }
  renderTileLayer(layer) {
    for (let y = 0;y < layer.height; y++) {
      for (let x = 0;x < layer.width; x++) {
        const tile = this.tileset.tile(layer.tiles[y * layer.width + x]);
        if (!tile) {
          continue;
        }
        const width = tile[3];
        const height = tile[4];
        this.context.drawImage(...tile, Math.floor(width * x), Math.floor(height * y), width, height);
      }
    }
  }
  renderObjectGroup(layer) {
    for (const obj of layer.objects) {
      const tile = this.tileset.tile(obj.gid);
      if (!tile) {
        continue;
      }
      this.context.imageSmoothingEnabled = false;
      this.context.drawImage(...tile, obj.x, Math.ceil(obj.y - tile[4]), tile[3], tile[4]);
    }
  }
}

// physics/physics.manager.ts
class PhysicsManager {
  objects = [];
  register(object) {
    console.log("reg");
    this.objects.push(object);
  }
  unregister(object) {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
  }
  update(deltaTime) {
    const dt = deltaTime / 1000;
    this.updatePositions(dt);
    this.detectAndResolveCollisions();
  }
  updatePositions(dt) {
    for (const obj of this.objects) {
      if (obj.isStatic)
        continue;
      obj.x += obj.velocity.x * dt;
      obj.y += obj.velocity.y * dt;
    }
  }
  detectAndResolveCollisions() {
    for (let i = 0;i < this.objects.length; i++) {
      for (let j = i + 1;j < this.objects.length; j++) {
        const objA = this.objects[i];
        const objB = this.objects[j];
        if (this.checkAABBCollision(objA, objB)) {
          this.resolveCollision(objA, objB);
        }
      }
    }
  }
  checkAABBCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
  resolveCollision(a, b) {
    if (a instanceof BaseEntity) {
      a.onTouch(b);
    }
    if (b instanceof BaseEntity) {
      b.onTouch(a);
    }
    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);
    if (overlapX < overlapY) {
      this.resolveHorizontalCollision(a, b, overlapX);
    } else {
      this.resolveVerticalCollision(a, b, overlapY);
    }
  }
  resolveHorizontalCollision(a, b, overlap) {
    const pushA = !a.isStatic;
    const pushB = !b.isStatic;
    if (pushA && pushB) {
      const resolution = overlap * 0.5;
      if (a.x < b.x) {
        a.x -= resolution;
        b.x += resolution;
      } else {
        a.x += resolution;
        b.x -= resolution;
      }
    } else if (pushA) {
      if (a.x < b.x) {
        a.x -= overlap;
      } else {
        a.x += overlap;
      }
    } else if (pushB) {
      if (a.x < b.x) {
        b.x += overlap;
      } else {
        b.x -= overlap;
      }
    }
    if (!a.isStatic)
      a.velocity = new Vector(0, a.velocity.y);
    if (!b.isStatic)
      b.velocity = new Vector(0, b.velocity.y);
  }
  resolveVerticalCollision(a, b, overlap) {
    const pushA = !a.isStatic;
    const pushB = !b.isStatic;
    if (pushA && pushB) {
      const resolution = overlap * 0.5;
      if (a.y < b.y) {
        a.y -= resolution;
        b.y += resolution;
      } else {
        a.y += resolution;
        b.y -= resolution;
      }
    } else if (pushA) {
      if (a.y < b.y) {
        a.y -= overlap;
      } else {
        a.y += overlap;
      }
    } else if (pushB) {
      if (a.y < b.y) {
        b.y += overlap;
      } else {
        b.y -= overlap;
      }
    }
    if (!a.isStatic)
      a.velocity = new Vector(a.velocity.x, 0);
    if (!b.isStatic)
      b.velocity = new Vector(b.velocity.x, 0);
  }
  getObjectCount() {
    return this.objects.length;
  }
  clear() {
    this.objects = [];
  }
  getObjects() {
    return [...this.objects];
  }
}

// index.ts
async function init() {
  const { schema, tileset } = await MapAdapter.fromURL("./tiled/map.json");
  const mapRenderer = new CanvasMapRenderer("#canvas", tileset);
  const controlsManager = new ControlsManager;
  const mapManager = new MapManager(mapRenderer, schema, tileset);
  const physicsManager = new PhysicsManager;
  const hero = mapManager.entities.find(({ type }) => type === "hero");
  controlsManager.bindEntity(hero);
  for (const entity of mapManager.entities) {
    physicsManager.register(entity);
  }
  setInterval(() => {
    physicsManager.update(16);
  }, 16);
}
init();
