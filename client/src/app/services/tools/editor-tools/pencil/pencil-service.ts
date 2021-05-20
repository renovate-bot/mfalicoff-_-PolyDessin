import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { MouseButton } from '@app/classes/mouse-buttons';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    private data: Data = new Data();
    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.clearPath();
        this.name = 'pencil';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        if (this.mouseDown) {
            this.undoRedoService.dataRedoArray = [];
            this.clearPath();
            this.clearData();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.data.currentTool = this;
            this.data.path.push(this.mouseDownCoord);
            this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
            this.data.color.push(this.drawingService.baseCtx.strokeStyle as string);
            this.data.name = 'pencil';
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.data.path.push(mousePosition);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
            this.data.path.push(mousePosition);
            this.undoRedoService.pushToArray(this.data as Data);
        }
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && !this.mouseOut) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
            setTimeout(() => {
                this.data.path.push(mousePosition);
            }, Constants.TIMER_DELAY_20);
        }
    }

    onMouseOut(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = true;
        this.drawLine(this.drawingService.baseCtx, this.pathData);
        this.clearPath();
    }

    onMouseOver(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = false;
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.imageSmoothingEnabled = true;
        ctx.miterLimit = 1;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'round'; // Arrondi le trait du crayon
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
        this.drawingService.baseCtx.lineCap = 'round';
        for (const positions of data.path) {
            this.drawingService.baseCtx.lineTo(positions.x, positions.y);
        }
        this.drawingService.baseCtx.stroke();
    }

    initTool(): void {
        this.clearForTool();
        const color = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        this.drawingService.previewCtx.lineWidth = Constants.PENCIL_FONT_SIZE;
        this.drawingService.baseCtx.lineWidth = Constants.PENCIL_FONT_SIZE;
        this.drawingService.previewCtx.strokeStyle = color;
        this.drawingService.baseCtx.strokeStyle = color;
    }
}
