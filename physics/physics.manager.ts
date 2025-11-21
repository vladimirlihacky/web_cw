import { BaseEntity } from "../entities/base.entity";
import { Vector } from "./physics.base";
import type { PhysicalObject } from "./physics.interfaces";


export class PhysicsManager {
    private objects: PhysicalObject[] = [];

    register(object: PhysicalObject): void {
        console.log("reg")
        this.objects.push(object);
    }

    unregister(object: PhysicalObject): void {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    update(deltaTime: number): void {
        const dt = deltaTime / 1000;
        
        this.updatePositions(dt);        
        this.detectAndResolveCollisions();
    }

    private updatePositions(dt: number): void {
        for (const obj of this.objects) {
            if (obj.isStatic) continue;
            
            obj.x += obj.velocity.x * dt;
            obj.y += obj.velocity.y * dt;
        }
    }

    private detectAndResolveCollisions(): void {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const objA = this.objects[i];
                const objB = this.objects[j];

                if (this.checkAABBCollision(objA, objB)) {
                    this.resolveCollision(objA, objB);
                }
            }
        }
    }

    private checkAABBCollision(a: PhysicalObject, b: PhysicalObject): boolean {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    private resolveCollision(a: PhysicalObject, b: PhysicalObject): void {
        if(a instanceof BaseEntity) {
            a.onTouch(b);
        }
        if(b instanceof BaseEntity) {
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

    private resolveHorizontalCollision(a: PhysicalObject, b: PhysicalObject, overlap: number): void {
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
        
        if (!a.isStatic) a.velocity = new Vector(0, a.velocity.y);
        if (!b.isStatic) b.velocity = new Vector(0, b.velocity.y);
    }

    private resolveVerticalCollision(a: PhysicalObject, b: PhysicalObject, overlap: number): void {
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
        
        if (!a.isStatic) a.velocity = new Vector(a.velocity.x, 0);
        if (!b.isStatic) b.velocity = new Vector(b.velocity.x, 0);
    }

    getObjectCount(): number {
        return this.objects.length;
    }

    clear(): void {
        this.objects = [];
    }

    getObjects(): PhysicalObject[] {
        return [...this.objects];
    }
}