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
export class EllipseService extends Tool {
    startXPosition: number;
    startYPosition: number;
    endXPosition: number;
    endYPosition: number;

    previousEndPositionX: number;
    previousEndPositionY: number;
    scaleX: number;
    scaleY: number;

    centerX: number;
    centerY: number;

    lastScaleX: number | undefined;
    lastScaleY: number | undefined;
    lastCenterX: number;
    lastCenterY: number;

    isShiftPressedForCircle: boolean = false;
    lineWidth: number;
    currentToolType: string;

    private data: Data = new Data();

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'ellipse';
        this.currentToolType = 'contour';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        if (this.mouseDown) {
            this.startXPosition = this.getPositionFromMouse(event).x;
            this.startYPosition = this.getPositionFromMouse(event).y;
            this.undoRedoService.dataRedoArray = [];
            this.clearData();
            this.data.currentTool = this;
            this.data.color.push(this.drawingService.baseCtx.strokeStyle as string);
            this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
            this.data.name = 'ellipse';
            this.data.path.push({ x: this.startXPosition, y: this.startYPosition } as Vec2);
        }
    }

    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const strokeColor = `rgb(${this.colorService.secondaryRed},${this.colorService.secondaryGreen},${this.colorService.secondaryBlue},${this.colorService.secondaryOpacity})`;
            this.drawingService.drawEllipse(
                { x: this.scaleX, y: this.scaleY } as Vec2,
                { x: this.centerX, y: this.centerY } as Vec2,
                this.currentToolType,
                strokeColor,
                this.drawingService.baseCtx,
            );
            setTimeout(() => {
                if (this.endYPosition !== this.previousEndPositionY && this.endXPosition !== this.previousEndPositionX) {
                    const endPosition: Vec2 = { x: this.endXPosition, y: this.endYPosition } as Vec2;
                    this.previousEndPositionX = this.endXPosition;
                    this.previousEndPositionY = this.endYPosition;
                    this.data.path.push(endPosition);
                    this.undoRedoService.pushToArray(this.data as Data);
                }
            }, Constants.TIMER_DELAY_20);
        }
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftPressedForCircle = true;
            if (this.mouseDown) this.drawPreview(this.drawingService.previewCtx);
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftPressedForCircle = false;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawPreview(this.drawingService.previewCtx);
            }
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endXPosition = this.getPositionFromMouse(event).x;
            this.endYPosition = this.getPositionFromMouse(event).y;
            this.drawPreview(this.drawingService.previewCtx);
        }
    }

    extractScaling(): void {
        this.scaleX = 1 * ((this.endXPosition - this.startXPosition) / 2);
        this.scaleY = 1 * ((this.endYPosition - this.startYPosition) / 2);
        this.centerX = this.startXPosition / this.scaleX + 1;
        this.centerY = this.startYPosition / this.scaleY + 1;
    }

    private extractCircle(): void {
        const scale = Math.min(Math.abs(this.scaleX), Math.abs(this.scaleY));
        this.lastScaleX = this.scaleX;
        this.lastScaleY = this.scaleY;
        this.scaleX = this.getSign(this.endXPosition - this.startXPosition) * scale;
        this.scaleY = this.getSign(this.endYPosition - this.startYPosition) * scale;
        this.centerX = this.startXPosition / this.scaleX + 1;
        this.centerY = this.startYPosition / this.scaleY + 1;
    }

    drawPreview(ctx: CanvasRenderingContext2D): void {
        this.extractScaling();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.lineWidth = this.lineWidth;
        if (this.isShiftPressedForCircle) {
            this.extractCircle();
        } else if (this.lastCenterX && this.lastCenterY) {
            this.extractScaling();
            ctx.scale(this.scaleX, this.scaleY);
        }
        const strokeColor = `rgb(${this.colorService.secondaryRed},${this.colorService.secondaryGreen},${this.colorService.secondaryBlue},${this.colorService.secondaryOpacity})`;
        this.drawingService.drawEllipse(
            { x: this.scaleX, y: this.scaleY } as Vec2,
            { x: this.centerX, y: this.centerY } as Vec2,
            this.currentToolType,
            strokeColor,
            ctx,
        );
        this.data.color.push(strokeColor);
        this.data.toolPropriety = this.currentToolType;
        this.drawPreviewBox();
    }

    private drawPreviewBox(): void {
        const color = this.drawingService.baseCtx.strokeStyle;
        this.drawingService.baseCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.lineWidth = 1;
        const rectangleSideX = this.endXPosition - this.startXPosition;
        const rectangleSideY = this.endYPosition - this.startYPosition;
        this.drawingService.previewCtx.setLineDash([Constants.LINE_DASH_STRAIGHT, Constants.LINE_DASH_EMPTY]);
        this.drawingService.previewCtx.strokeRect(this.startXPosition, this.startYPosition, rectangleSideX, rectangleSideY);
        this.drawingService.previewCtx.setLineDash([]);
        this.drawingService.previewCtx.lineWidth = this.lineWidth;
        this.drawingService.baseCtx.strokeStyle = color;
        this.drawingService.previewCtx.strokeStyle = color;
    }

    getSign(numb: number): number {
        return Math.abs(numb) / numb;
    }

    changeFontSize(size: number): void {
        this.drawingService.baseCtx.lineWidth = size;
        this.drawingService.previewCtx.lineWidth = size;
        this.lineWidth = size;
    }

    changeToolType(selectedContour: string): void {
        this.currentToolType = selectedContour;
    }

    private clearData(): void {
        this.data = new Data();
        this.data.path = [];
    }

    redraw(data: Data): void {
        if (data.toolPropriety === 'plein') this.drawingService.baseCtx.fillStyle = data.color[0];
        const scale: Vec2 = {
            x: (data.path[1].x - data.path[0].x) / 2,
            y: (data.path[1].y - data.path[0].y) / 2,
        } as Vec2;
        const center: Vec2 = { x: data.path[0].x / scale.x + 1, y: data.path[0].y / scale.y + 1 };
        this.drawingService.drawEllipse(scale, center, data.toolPropriety, data.color[1], this.drawingService.baseCtx);
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const color = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        preCtx.lineWidth = Constants.ELLIPSE_FONT_SIZE;
        baseCtx.lineWidth = Constants.ELLIPSE_FONT_SIZE;
        this.lineWidth = Constants.ELLIPSE_FONT_SIZE;
        preCtx.strokeStyle = color;
        baseCtx.strokeStyle = color;
        baseCtx.fillStyle = color;
        preCtx.fillStyle = color;
        preCtx.lineCap = 'square';
        baseCtx.lineCap = 'square';
        this.currentToolType = 'contour';
    }
}
