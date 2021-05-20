import { Vec2 } from './vec2';

export class MouseUtilities {
    constructor() {}
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
