import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    pathData: Vec2[];
    private data: Data = new Data();
    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.clearPath();
        this.name = 'eraser';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        if (this.mouseDown) {
            this.undoRedoService.dataRedoArray = [];
            this.clearPath();
            this.clearData();
            this.data.currentTool = this;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
            this.data.color.push(this.drawingService.baseCtx.strokeStyle as string);
            this.data.name = 'eraser';
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
            setTimeout(() => {
                this.data.path.push(this.mouseDownCoord);
            }, Constants.TIMER_DELAY_20);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
            setTimeout(() => {
                this.data.path.push(mousePosition);
                this.undoRedoService.pushToArray(this.data as Data);
            }, Constants.TIMER_DELAY_20);
        }
        this.mouseDown = false;
        this.drawingService.isDrawing = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const fontSize: number = this.drawingService.previewCtx.lineWidth; // on sauvegarde la valeur du lineWidth pour s'en reservire plus tard
        this.drawingService.previewCtx.save();
        const mousePosition = this.getPositionFromMouse(event);
        if (!this.mouseOut) {
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.lineWidth = 1;
            this.drawingService.previewCtx.fillStyle = 'white';
            this.drawingService.previewCtx.fillRect(
                this.pathData[this.pathData.length - 1].x - fontSize / 2,
                this.pathData[this.pathData.length - 1].y - fontSize / 2,
                fontSize - this.drawingService.previewCtx.lineWidth,
                fontSize - this.drawingService.previewCtx.lineWidth,
            );

            this.drawingService.previewCtx.strokeStyle = 'black';
            this.drawingService.previewCtx.strokeRect(
                this.pathData[this.pathData.length - 1].x - fontSize / 2,
                this.pathData[this.pathData.length - 1].y - fontSize / 2,
                fontSize - this.drawingService.previewCtx.lineWidth,
                fontSize - this.drawingService.previewCtx.lineWidth,
            );
        }

        this.drawingService.previewCtx.restore();
        if (this.mouseDown && !this.mouseOut) {
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
            setTimeout(() => {
                this.data.path.push(mousePosition);
            }, Constants.TIMER_DELAY_20);
        }
    }

    onMouseOut(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = true;
        this.clearPath();
    }

    onMouseOver(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = false;
    }

    private eraseLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.imageSmoothingEnabled = true;
        ctx.miterLimit = 1;
        ctx.lineJoin = 'miter';
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    private clearData(): void {
        this.data = new Data();
        this.data.path = [];
    }

    redraw(data: Data): void {
        this.drawingService.baseCtx.lineCap = 'square';
        for (const positions of data.path) {
            this.drawingService.baseCtx.lineTo(positions.x, positions.y);
        }
        this.drawingService.baseCtx.stroke();
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        preCtx.lineWidth = Constants.ERASER_FONT_SIZE;
        baseCtx.lineWidth = Constants.ERASER_FONT_SIZE;
        preCtx.strokeStyle = 'white';
        baseCtx.strokeStyle = 'white';
        preCtx.lineCap = 'square';
        baseCtx.lineCap = 'square';
        preCtx.imageSmoothingEnabled = true;
        baseCtx.imageSmoothingEnabled = true;
        preCtx.miterLimit = 1;
        baseCtx.miterLimit = 1;
        preCtx.lineJoin = 'miter';
        baseCtx.lineJoin = 'miter';
    }
}
