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
export class LineService extends Tool {
    pathData: Vec2[];
    currentToolType: string;
    currentDiameterSize: number;
    mouseDownCoord: Vec2;

    private data: Data = new Data();
    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'line';
        this.pathData = [];
        this.currentToolType = 'sans';
    }

    onClick(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (this.pathData.length >= 1) {
            this.drawLine(this.drawingService.previewCtx);
        }
        this.undoRedoService.dataRedoArray = [];
        this.data.currentTool = this;
        this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
        this.data.color.push(this.drawingService.baseCtx.strokeStyle as string);
        this.data.name = 'line';
        this.pathData.push(this.mouseDownCoord);
        this.data.path.push(this.mouseDownCoord);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.pathData.push(this.getPositionFromMouse(event));
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx);
            this.pathData.pop();
            return;
        }
    }

    doubleClick(event: MouseEvent): void {
        const currentPosition = this.getPositionFromMouse(event);
        if (this.isPointCloseToStart(currentPosition) && this.pathData.length > 2) {
            this.pathData.pop();
            this.pathData.push(this.pathData[0]);
            this.data.path.pop();
            this.data.path.push(this.pathData[0]);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx);
        } else {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.baseCtx);
        }
        this.pathData = [];
        this.undoRedoService.pushToArray(this.data as Data);

        this.clearData();
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
    }

    isPointCloseToStart(currentPosition: Vec2): boolean {
        return (
            Math.sqrt(Math.pow(currentPosition.x - this.pathData[0].x, 2) + Math.pow(currentPosition.y - this.pathData[0].y, 2)) <=
            Constants.NEW_LINE_MAX_DISTANCE
        );
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.pathData = [];
        } else if (event.key === 'Backspace') {
            if (this.pathData.length >= 2) {
                this.pathData.pop();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawLine(this.drawingService.previewCtx);
            }
        }
        return;
    }

    drawLine(ctx: CanvasRenderingContext2D): void {
        this.data.toolPropriety = this.currentToolType;
        ctx.beginPath();
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        if (this.currentToolType === 'avec') {
            ctx.beginPath();

            for (const point of this.pathData) {
                this.drawJunction(ctx, point);
            }
        }
    }

    drawJunction(ctx: CanvasRenderingContext2D, point: Vec2): void {
        const strokeColor = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        ctx.fillStyle = strokeColor;
        this.data.color.push(strokeColor);
        ctx.beginPath();
        ctx.arc(point.x, point.y, this.currentDiameterSize, 0, 2 * Math.PI, false);
        ctx.fill();
        this.data.diameterSize = this.currentDiameterSize;
    }

    changeToolType(toolPropriety: string): void {
        this.currentToolType = toolPropriety;
    }

    changeToolTypePropriety(value: number): void {
        if (value > 0 && value < Constants.MAX_SIZE_WIDTH) this.currentDiameterSize = value;
    }

    private clearData(): void {
        this.data = new Data();
        this.data.path = [];
    }

    redraw(data: Data): void {
        this.drawingService.baseCtx.beginPath();
        for (const positions of data.path) {
            this.drawingService.baseCtx.strokeStyle = data.color[0];
            this.drawingService.baseCtx.lineTo(positions.x, positions.y);
        }
        this.drawingService.baseCtx.stroke();
        if (data.toolPropriety === 'avec') {
            for (const positions of data.path) {
                this.drawingService.baseCtx.fillStyle = data.color[1];
                this.drawingService.baseCtx.beginPath();
                this.drawingService.baseCtx.arc(positions.x, positions.y, data.diameterSize, 0, 2 * Math.PI, false);
                this.drawingService.baseCtx.fill();
            }
        }
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const color = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        preCtx.lineWidth = Constants.RECTANGLE_FONT_SIZE;
        baseCtx.lineWidth = Constants.RECTANGLE_FONT_SIZE;
        preCtx.strokeStyle = color;
        baseCtx.strokeStyle = color;
        preCtx.lineCap = 'square';
        baseCtx.lineCap = 'square';
        this.currentToolType = 'sans';
        this.currentDiameterSize = 1;
    }
}
