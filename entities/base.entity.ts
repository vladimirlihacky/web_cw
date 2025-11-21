import type { MapObject } from "../map/map.schema";
import { Vector } from "../physics/physics.base";
import type { PhysicalObject } from "../physics/physics.interfaces";

export class BaseEntity implements PhysicalObject, MapObject {
    id: number = 0;
    type: string = "";
    gid: number = 0;
    name: string = "";
    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;
    mass: number = 1;
    velocity: Vector = new Vector(0, 0);
    isStatic: boolean = false;

    move(x: number, y: number) {
        let direction = new Vector(x, y);

        if(!direction.equals(new Vector(0, 0))) {
            direction = direction.normalize() 
        }

        this.velocity = direction.multiplyScalar(60);
    }

    static fromMapObject(obj: MapObject) {
        const entity = Object.assign(
            new BaseEntity(),
            obj,
        )

        return entity as BaseEntity;
    }

    onTouch(entity: BaseEntity) {
        console.log(entity);
    }
}