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
export class PolygonService extends Tool {
    startXPosition: number;
    startYPosition: number;
    endXPosition: number;
    endYPosition: number;
    centerX: number;
    centerY: number;
    sideNumber: number;
    firstLineLength: number;
    currentToolType: string;
    borderAndFull: boolean = false;
    borderIsDifferent: boolean = false;
    lineWidth: number;
    mouseDownCoord: Vec2;
    mouseUpCoord: Vec2;

    private data: Data = new Data();

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'polygon';
        this.currentToolType = 'contour';
        this.sideNumber = Constants.INITIAL_SIDE_POLYGON;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.startXPosition = this.mouseDownCoord.x;
            this.startYPosition = this.mouseDownCoord.y;
            this.undoRedoService.dataRedoArray = [];
            this.clearData();
            this.data.currentTool = this;
            this.data.color.push(this.drawingService.baseCtx.strokeStyle as string);
            this.data.lineWidth = this.drawingService.baseCtx.lineWidth;
            this.data.name = 'polygon';
            this.data.path.push({ x: this.startXPosition, y: this.startYPosition } as Vec2);
            this.endXPosition = this.mouseDownCoord.x;
            this.endYPosition = this.mouseDownCoord.y;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endXPosition = this.getPositionFromMouse(event).x;
            this.endYPosition = this.getPositionFromMouse(event).y;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.lineWidth = this.lineWidth;
            const strokeColor = `rgb(${this.colorService.secondaryRed},${this.colorService.secondaryGreen},${this.colorService.secondaryBlue},${this.colorService.secondaryOpacity})`;
            this.drawingService.drawPreviewCircle(this.startXPosition, this.startYPosition, this.endXPosition, this.endYPosition);
            this.drawingService.drawPolygon(
                this.drawingService.previewCtx,
                this.currentToolType,
                this.borderAndFull,
                this.startXPosition,
                this.startYPosition,
                this.sideNumber,
                this.endXPosition,
                this.endYPosition,
                strokeColor,
            );
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseUpCoord = this.getPositionFromMouse(event);

            if (this.mouseDownCoord.x !== this.mouseUpCoord.x && this.mouseDownCoord.y !== this.mouseUpCoord.y) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                const strokeColor = `rgb(${this.colorService.secondaryRed},${this.colorService.secondaryGreen},${this.colorService.secondaryBlue},${this.colorService.secondaryOpacity})`;
                this.drawingService.drawPolygon(
                    this.drawingService.baseCtx,
                    this.currentToolType,
                    this.borderAndFull,
                    this.startXPosition,
                    this.startYPosition,
                    this.sideNumber,
                    this.endXPosition,
                    this.endYPosition,
                    strokeColor,
                );

                setTimeout(() => {
                    this.data.path.push({ x: this.endXPosition, y: this.endYPosition } as Vec2);
                    this.data.toolPropriety = this.currentToolType;
                    this.data.polygonSideNumber = this.sideNumber;
                    this.data.polygonBorderFull = this.borderAndFull;
                    this.data.color.push(strokeColor);
                    this.undoRedoService.pushToArray(this.data as Data);

                    this.drawingService.clearCanvas(this.drawingService.previewCtx);
                }, Constants.TIMER_DELAY_20);
            }
        }
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
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
        this.drawingService.drawPolygon(
            this.drawingService.baseCtx,
            data.toolPropriety,
            data.polygonBorderFull,
            data.path[0].x,
            data.path[0].y,
            data.polygonSideNumber,
            data.path[1].x,
            data.path[1].y,
            data.color[1],
        );
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const color = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        preCtx.lineWidth = Constants.POLYGON_FONT_SIZE;
        baseCtx.lineWidth = Constants.POLYGON_FONT_SIZE;
        preCtx.strokeStyle = color;
        baseCtx.strokeStyle = color;
        preCtx.fillStyle = color;
        baseCtx.fillStyle = color;
        preCtx.lineCap = 'square';
        baseCtx.lineCap = 'square';
        this.currentToolType = 'contour';
        this.sideNumber = Constants.INITIAL_SIDE_POLYGON;
    }
}
