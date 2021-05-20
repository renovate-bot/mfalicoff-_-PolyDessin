import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { MouseButton } from '@app/classes/mouse-buttons';
import { Selector } from '@app/classes/selector';
import { Tool } from '@app/classes/tool';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleSelectorService } from '@app/services/tools/editor-tools/content-selector/rectangle-selector/rectangle-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class ContentSelectorService extends Tool {
    selectorTool: Selector = new RectangleSelectorService(this.drawingService);

    isResizing: boolean = false;
    firstDragDone: boolean = false;
    needToResetSelection: boolean = false;
    firstResizeDone: boolean = false;

    oldEventX: number = 0;
    oldEventY: number = 0;

    data: Data = new Data();
    initialPush: boolean = true;

    arrowUp: boolean = false;
    arrowDown: boolean = false;
    arrowLeft: boolean = false;
    arrowRight: boolean = false;

    delayIsFinished: boolean = false;
    delayTimer: number = 0;
    refreshTimer: number = 0;

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'selector';
    }
    onMouseDown(event: MouseEvent): void {
        this.drawingService.selectorCtx.fillStyle = 'white';
        this.drawingService.selectorCtx.strokeStyle = 'grey';
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.isResizing && this.mouseDown) {
            this.firstResizeDone = false;
            const x = this.getPositionFromMouse(event).x;
            const y = this.getPositionFromMouse(event).y;
            if (this.drawingService.areaIsSelected && this.isMouseInSelectZone(x, y)) {
                this.oldEventX = x;
                this.oldEventY = y;
                this.initialUpdateOnCanvas();
            } else {
                if (this.needToResetSelection && (this.selectorTool.name === 'rectangle' || this.selectorTool.pathClosed)) {
                    this.needToResetSelection = false;
                    this.unselect();
                } else {
                    this.needToResetSelection = true;
                    if (this.selectorTool.name === 'rectangle' || this.selectorTool.pathClosed) {
                        this.selectorTool.resetSelector();
                        this.firstDragDone = false;
                        this.drawingService.areaIsSelected = false;
                        this.drawingService.isDrawing = true;
                        this.drawingService.initialPush = true;
                        this.selectorTool.initialPosition.x = x;
                        this.selectorTool.initialPosition.y = y;

                        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
                        this.selectorTool.onMouseDown(x, y);
                    }
                }
            }
        }
    }
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing && (this.mouseDown || this.selectorTool.name === 'freehand') && this.needToResetSelection) {
            if (this.drawingService.areaIsSelected && this.mouseDown) {
                const deltaX = this.getPositionFromMouse(event).x - this.oldEventX;
                const deltaY = this.getPositionFromMouse(event).y - this.oldEventY;
                this.selectorTool.updatePathData(deltaX, deltaY);
                this.selectorTool.start.x += deltaX;
                this.selectorTool.start.y += deltaY;
                this.selectorTool.end.x += deltaX;
                this.selectorTool.end.y += deltaY;
                this.oldEventX = this.getPositionFromMouse(event).x;
                this.oldEventY = this.getPositionFromMouse(event).y;
                this.selectorTool.redrawSelectedArea();
            } else this.selectorTool.onMouseMove(event);
        }
    }
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        if (!this.isResizing && this.mouseDown && this.needToResetSelection) {
            this.selectorTool.onMouseUp(event);
            this.drawingService.baseCtx.drawImage(this.drawingService.previewCtx.canvas, 0, 0);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.drawingService.areaIsSelected) {
                this.selectorTool.startPosBeforeResize.x = this.selectorTool.start.x;
                this.selectorTool.startPosBeforeResize.y = this.selectorTool.start.y;
                this.selectorTool.endPosBeforeResize.x = this.selectorTool.end.x;
                this.selectorTool.endPosBeforeResize.y = this.selectorTool.end.y;
                this.pushDataToUndo();
            }
            if (this.selectorTool.name === 'rectangle' || this.selectorTool.pathClosed) this.drawingService.areaIsSelected = true;
        }
        this.mouseDown = false;
    }
    isMouseInSelectZone(x: number, y: number): boolean {
        return x >= this.selectorTool.start.x && x <= this.selectorTool.end.x && y >= this.selectorTool.start.y && y <= this.selectorTool.end.y;
    }

    selectAll(): void {
        this.selectorTool.start.x = 0;
        this.selectorTool.start.y = 0;
        this.selectorTool.end.x = this.drawingService.canvas.width;
        this.selectorTool.end.y = this.drawingService.canvas.height;
        this.selectorTool.initialPosition = { x: 0, y: 0 };
        this.firstDragDone = false;
        this.firstResizeDone = false;
        this.drawingService.areaIsSelected = true;
        this.drawingService.selectionIsActive = true;
        this.needToResetSelection = true;
        this.selectorTool.copyArea();
        this.selectorTool.redrawSelectedArea();
    }
    unselect(): void {
        this.drawingService.areaIsSelected = false;
        this.drawingService.initialPush = true;
        this.firstDragDone = false;
        this.firstResizeDone = false;
        this.resetCoords();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.drawingService.selectionIsActive = false;
        this.needToResetSelection = false;
    }
    resetCoords(): void {
        this.selectorTool.start.x = 0;
        this.selectorTool.start.y = 0;
        this.selectorTool.end.x = 0;
        this.selectorTool.end.y = 0;
    }
    resetTool(): void {
        this.unselect();
        this.resetCoords();
    }
    initialUpdateOnCanvas(): void {
        if (!this.firstDragDone) {
            this.firstDragDone = true;
            this.selectorTool.clearUnderSelection();
        } else {
            this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
            this.drawingService.baseCtx.drawImage(this.drawingService.previousCtx.canvas, 0, 0);
        }
        this.selectorTool.redrawSelectedArea();
    }
    handleKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                if (!this.arrowDown && !this.arrowLeft && !this.arrowRight && !this.arrowUp && this.drawingService.areaIsSelected) {
                    this.initialUpdateOnCanvas();

                    this.arrowKeyUpdate();
                    this.delayTimer = window.setTimeout(() => {
                        this.startRefreshTimer();
                    }, Constants.TIMER_DELAY_500);
                }
                switch (event.key) {
                    case 'ArrowLeft':
                        this.arrowLeft = true;
                        break;
                    case 'ArrowRight':
                        this.arrowRight = true;
                        break;
                    case 'ArrowUp':
                        this.arrowUp = true;
                        break;
                    case 'ArrowDown':
                        this.arrowDown = true;
                        break;
                }
                break;
            default:
                this.handleShortcuts(event);
                break;
        }
    }
    handleShortcuts(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.mouseDown)
            if (!this.selectorTool.isShiftPressed) {
                this.selectorTool.isShiftPressed = true;
                this.selectorTool.updateAfterShift();
            }
        if (event.ctrlKey && event.code === 'KeyA') {
            event.preventDefault();
            this.selectAll();
        }
        if (event.key === 'Escape') {
            this.unselect();
            this.resetCoords();
            this.selectorTool.resetSelector();
        }
        if (event.key === 'Backspace') {
            this.selectorTool.removePoint();
        }
    }
    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            this.arrowKeyUpdate();
            switch (event.key) {
                case 'ArrowLeft':
                    this.arrowLeft = false;
                    break;
                case 'ArrowRight':
                    this.arrowRight = false;
                    break;
                case 'ArrowUp':
                    this.arrowUp = false;
                    break;
                case 'ArrowDown':
                    this.arrowDown = false;
                    break;
            }
            this.resetTimers();
            this.pushDataToUndo();
        }
        if (event.key === 'Shift') {
            this.selectorTool.isShiftPressed = false;
            if (this.mouseDown) this.selectorTool.redrawSelectedArea();
        }
        this.drawingService.selectionIsActive = true;
    }
    startRefreshTimer(): void {
        this.refreshTimer = window.setTimeout(() => {
            this.arrowKeyUpdate();
            if (this.arrowDown || this.arrowLeft || this.arrowRight || this.arrowUp) this.startRefreshTimer();
        }, Constants.TIMER_DELAY_100);
    }
    resetTimers(): void {
        if (!this.arrowDown && !this.arrowLeft && !this.arrowRight && !this.arrowUp) {
            window.clearTimeout(this.delayTimer);
            window.clearTimeout(this.refreshTimer);
            this.arrowKeyUpdate();
            this.drawingService.baseCtx.drawImage(this.drawingService.previewCtx.canvas, 0, 0);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.pushDataToUndo();
        }
    }
    arrowKeyUpdate(): void {
        const drag = { x: 0, y: 0 };
        if (this.arrowLeft) drag.x -= Constants.PIXEL_INCREMENT_ARROWS;
        if (this.arrowRight) drag.x += Constants.PIXEL_INCREMENT_ARROWS;
        if (this.arrowUp) drag.y -= Constants.PIXEL_INCREMENT_ARROWS;
        if (this.arrowDown) drag.y += Constants.PIXEL_INCREMENT_ARROWS;
        this.selectorTool.updatePathData(drag.x, drag.y);
        this.selectorTool.start.x += drag.x;
        this.selectorTool.start.y += drag.y;
        this.selectorTool.end.x += drag.x;
        this.selectorTool.end.y += drag.y;
        this.selectorTool.updatePreviousCtx();
        this.selectorTool.redrawSelectedArea();
    }
    pushDataToUndo(): void {
        this.data = new Data();
        this.undoRedoService.dataRedoArray = [];
        this.data.currentTool = this;
        this.data.name = 'selector';
        this.data.selectedArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.initialArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.finalArea = document.createElement('canvas') as HTMLCanvasElement;

        this.data.initialPosition = { x: this.selectorTool.initialPosition.x, y: this.selectorTool.initialPosition.y };
        this.data.finalPosition = { x: this.selectorTool.start.x, y: this.selectorTool.start.y };

        const width = this.selectorTool.end.x - this.selectorTool.start.x + 1;
        const height = this.selectorTool.end.y - this.selectorTool.start.y + 1;
        this.data.initialArea.width = width;
        this.data.initialArea.height = height;
        (this.data.initialArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.baseCtx.canvas,
            this.selectorTool.initialPosition.x,
            this.selectorTool.initialPosition.y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        this.data.finalArea.width = width;
        this.data.finalArea.height = height;
        (this.data.finalArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.previousCtx.canvas,
            this.selectorTool.start.x,
            this.selectorTool.start.y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        (this.data.selectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(this.selectorTool.selectedArea, 0, 0);

        if (!this.drawingService.initialPush) {
            this.undoRedoService.popLastItem();
            this.undoRedoService.pushToArray(this.data);
        } else {
            this.drawingService.initialPush = false;
            this.undoRedoService.pushToArray(this.data);
        }
        this.data = new Data();
    }

    redraw(data: Data): void {
        this.drawingService.baseCtx.clearRect(data.initialPosition.x, data.initialPosition.y, data.initialArea.width, data.initialArea.height);
        this.drawingService.baseCtx.drawImage(data.initialArea, data.initialPosition.x, data.initialPosition.y);
        this.drawingService.baseCtx.drawImage(data.selectedArea, data.finalPosition.x, data.finalPosition.y);
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const selectorCtx: CanvasRenderingContext2D = this.drawingService.selectorCtx;
        this.resetTool();
        preCtx.lineWidth = Constants.RECTANGLE_FONT_SIZE;
        baseCtx.lineWidth = Constants.RECTANGLE_FONT_SIZE;
        selectorCtx.setLineDash([Constants.LINE_DASH_SELECTOR, Constants.LINE_DASH_SELECTOR]);
        preCtx.strokeStyle = 'rgb(0,0,0,1)';
        baseCtx.strokeStyle = 'rgb(0,0,0,1)';
    }
}
