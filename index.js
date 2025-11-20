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

// index.ts
var controlsManager = new ControlsManager;
console.log(controlsManager);
