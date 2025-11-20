import { ControlsManager } from "./controls/controls.manager";
import { MapAdapter } from "./map/map.adapter";

const controlsManager = new ControlsManager();

console.log(controlsManager);

MapAdapter.fromURL("./tiled/map.json").then(console.log)