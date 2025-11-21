import type { Vector } from "./physics.base";

export interface PhysicalObject {
    x: number;
    y: number;
    height: number;
    width: number;
    mass: number;
    velocity: Vector;
    isStatic: boolean;
}