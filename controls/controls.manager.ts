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
    private userIO = new UserIOManager();
    
    constructor() {
        this.userIO.events.subscribe((name, { control }) => {
            console.log(name, control)
        })
    }
}