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
export class RectangleService extends Tool {
    startXPosition: number;
    startYPosition: number;
    endXPosition: number;
    endYPosition: number;
    lastMousePositionX: number;
    lastMousePositionY: number;

    currentToolType: string;

    private data: Data = new Data();

    private isShiftPressedForSquare: boolean;
    mouseDownCoord: Vec2;
    mouseUpCoord: Vec2;

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'rectangle';
        this.isShiftPressedForSquare = false;
        this.currentToolType = 'contour';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        if (this.mouseDown) {
            this.startXPosition = 0;
            this.startYPosition = 0;
            this.endXPosition = 0;
            this.endYPosition = 0;
            this.undoRedoService.dataRedoArray = [];
            this.clearData();
            this.data.currentTool = this;
            const color = this.drawingService.baseCtx.strokeStyle as string;
            this.data.color.push(color);
            this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
            this.data.name = 'rectangle';
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.startXPosition = this.mouseDownCoord.x;
            this.startYPosition = this.mouseDownCoord.y;
            this.data.path.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseUpCoord = this.getPositionFromMouse(event);
            this.mouseDown = false;
            this.lastMousePositionX = 0;
            this.lastMousePositionY = 0;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.baseCtx);
            setTimeout(() => {
                if (this.endXPosition !== 0 && this.endYPosition !== 0) {
                    const endPosition: Vec2 = { x: this.endXPosition, y: this.endYPosition } as Vec2;
                    this.data.path.push(endPosition);
                    this.undoRedoService.pushToArray(this.data as Data);
                }
            }, Constants.TIMER_DELAY_20);
        }
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.mouseDown) {
            this.isShiftPressedForSquare = true;
            this.drawRectangle(this.drawingService.previewCtx);
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftPressedForSquare = false;
            this.drawRectangle(this.drawingService.previewCtx);
            this.lastMousePositionX = 0;
            this.lastMousePositionY = 0;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endXPosition = this.getPositionFromMouse(event).x - this.startXPosition;
            this.endYPosition = this.getPositionFromMouse(event).y - this.startYPosition;

            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.drawRectangle(this.drawingService.previewCtx);
        }
        return;
    }

    onMouseOut(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = true;
    }

    onMouseOver(event: MouseEvent): void {
        event.preventDefault();
        this.mouseOut = false;
    }

    private extractSquare(): Vec2 {
        let rectangleWidth = Math.abs(this.isWidthSmallest(this.endXPosition, this.endYPosition) ? this.endXPosition : this.endYPosition);
        let rectangleHeight = rectangleWidth;
        if (this.endXPosition > 0) {
            if (this.endYPosition < 0) {
                rectangleHeight = -rectangleHeight;
            }
        } else {
            rectangleWidth = -rectangleWidth;
            if (this.endYPosition < 0) {
                rectangleHeight = -rectangleHeight;
            }
        }
        this.lastMousePositionX = this.endXPosition;
        this.lastMousePositionY = this.endYPosition;

        return { x: rectangleWidth, y: rectangleHeight };
    }

    drawRectangle(ctx: CanvasRenderingContext2D): void {
        if (this.isShiftPressedForSquare) {
            const square = this.extractSquare();
            this.endXPosition = square.x;
            this.endYPosition = square.y;
        } else if (this.lastMousePositionX && this.lastMousePositionY) {
            this.endXPosition = this.lastMousePositionX;
            this.endYPosition = this.lastMousePositionY;
            this.lastMousePositionX = 0;
            this.lastMousePositionY = 0;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        const strokeColor = `rgb(${this.colorService.secondaryRed},${this.colorService.secondaryGreen},${this.colorService.secondaryBlue},${this.colorService.secondaryOpacity})`;
        this.drawingService.drawRectangle(
            { x: this.startXPosition, y: this.startYPosition } as Vec2,
            { x: this.endXPosition, y: this.endYPosition } as Vec2,
            this.currentToolType,
            strokeColor,
            ctx,
        );
        this.data.color.push(strokeColor);
        this.data.toolPropriety = this.currentToolType;
        return;
    }

    isWidthSmallest(first: number, second: number): boolean {
        return Math.abs(first) < Math.abs(second);
    }

    changeFontSize(size: number): void {
        this.drawingService.baseCtx.lineWidth = size;
        this.drawingService.previewCtx.lineWidth = size;
    }

    changeToolType(toolPropriety: string): void {
        this.currentToolType = toolPropriety;
    }

    private clearData(): void {
        this.data = new Data();
        this.data.path = [];
    }

    redraw(data: Data): void {
        if (data.toolPropriety === 'plein') this.drawingService.baseCtx.fillStyle = data.color[0];
        this.drawingService.baseCtx.lineCap = 'square';
        this.drawingService.drawRectangle(
            data.path[0],
            data.path[data.path.length - 1],
            data.toolPropriety,
            data.color[1],
            this.drawingService.baseCtx,
        );
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
        preCtx.fillStyle = color;
        baseCtx.fillStyle = color;
        preCtx.lineCap = 'square';
        baseCtx.lineCap = 'square';
        this.currentToolType = 'contour';
    }
}
