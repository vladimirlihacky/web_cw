export namespace Events {
    export type Handler = (payload: any) => void;
    export type GlobalHandler = (name: string, payload: any) => void;

    export class Manager {
        private handlers: Map<string, Handler[]> = new Map();
        private globalHandlers: GlobalHandler[] = [];

        subscribe(handler: GlobalHandler) {
            this.globalHandlers.push(handler);
        }

        subscribeTo(name: string, handler: Handler) {
            if(!this.handlers.get(name)) {
                this.handlers.set(name, [])
            }

            this.handlers.get(name)!.push(handler)
        }

        notify(name: string, payload: any) {
            const handlers = this.handlers.get(name) ?? [];

            handlers.forEach(handle => handle(payload))
            this.globalHandlers.forEach(handle => handle(name, payload));
        }
    }
}