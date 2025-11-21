import type { BaseEntity } from "../entities/base.entity";
import { Events } from "../events/events.manager"
import { Controls } from "./controls.list";

export class UserIOManager {
    public readonly events = new Events.Manager(); 

    constructor() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this))
        document.addEventListener("keyup", this.handleKeyUp.bind(this))
    }

    private handleKeyDown({ code }: KeyboardEvent) {
        const control = this.controlFromCode(code)

        if(control === Controls.Unknown) return;

        this.events.notify("control.start", { control })
    }

    private handleKeyUp({ code }: KeyboardEvent) {
        const control = this.controlFromCode(code)

        if(control === Controls.Unknown) return;

        this.events.notify("control.stop", { control })
    }

    private controlFromCode(code: string): Controls {
        if(code === "ArrowUp" || code === "KeyW") return Controls.Up; 
        if(code === "ArrowDown" || code === "KeyS") return Controls.Down; 
        if(code === "ArrowLeft" || code === "KeyA") return Controls.Left; 
        if(code === "ArrowRight" || code === "KeyD") return Controls.Right; 

        return Controls.Unknown;
    }
}


export class ControlsManager {
    public userIO = new UserIOManager();
    private activeControls = new Set<Controls>();
    private boundEntity: { move: (x: number, y: number) => void } | null = null;
    
    constructor() {
        this.userIO.events.subscribeTo("control.start", (data: { control: Controls }) => {
            this.activeControls.add(data.control);
            this.updateMovement();
        });
        
        this.userIO.events.subscribeTo("control.stop", (data: { control: Controls }) => {
            this.activeControls.delete(data.control);
            this.updateMovement();
        });
    }

    bindEntity(entity: BaseEntity) {
        this.boundEntity = entity;
    }

    private updateMovement() {
        if (!this.boundEntity) return;

        let x = 0;
        let y = 0;

        if (this.activeControls.has(Controls.Left)) x -= 1;
        if (this.activeControls.has(Controls.Right)) x += 1;
        if (this.activeControls.has(Controls.Up)) y -= 1;
        if (this.activeControls.has(Controls.Down)) y += 1;

        this.boundEntity.move(x, y);
    }
}