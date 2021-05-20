import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Data } from './data';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseUpCoord: Vec2;
    mouseDown: boolean = false;
    mouseOut: boolean = false;

    name: string;

    constructor(public drawingService: DrawingService, protected colorService: ColorService, public undoRedoService: UndoRedoService) {
        this.name = '';
    }

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseOut(event: MouseEvent): void {}

    onMouseOver(event: MouseEvent): void {}

    handleKeyDown(event: KeyboardEvent): void {}

    handleKeyUp(event: KeyboardEvent): void {}

    changeFontSize(size: number): void {
        this.drawingService.baseCtx.lineWidth = size;
        this.drawingService.previewCtx.lineWidth = size;
    }
    clearForTool(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.drawingService.previewCtx.setLineDash([1, 0]);
        this.drawingService.baseCtx.setLineDash([1, 0]);
    }

    initTool(): void {}

    onClick(event: MouseEvent): void {}

    doubleClick(event: MouseEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    changeToolType(toolPropriety: string): void {}

    changeToolTypePropriety(value: number): void {}

    resetTool(): void {}

    redraw(data: Data): void {}
}
