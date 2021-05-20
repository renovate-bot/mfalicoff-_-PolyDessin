import { Component, HostListener } from '@angular/core';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-content-selector-preview',
    templateUrl: './content-selector-preview.component.html',
    styleUrls: ['./content-selector-preview.component.scss'],
})
export class ContentSelectorResizeComponent {
    resizingStartX: boolean = false;
    resizingStartY: boolean = false;
    resizingEndX: boolean = false;
    resizingEndY: boolean = false;
    mirrorX: boolean = false;
    mirrorY: boolean = false;
    data: Data = new Data();

    posX: { x1: number; x2: number };
    posY: { y1: number; y2: number };

    constructor(
        public contentSelectorService: ContentSelectorService,
        public drawingService: DrawingService,
        private undoRedoService: UndoRedoService,
    ) {}

    getPointsX(): { x1: number; x2: number } {
        return {
            x1: this.contentSelectorService.selectorTool.start.x,
            x2: this.contentSelectorService.selectorTool.end.x,
        };
    }
    getPointsY(): { y1: number; y2: number } {
        return {
            y1: this.contentSelectorService.selectorTool.start.y,
            y2: this.contentSelectorService.selectorTool.end.y,
        };
    }
    getIsActive(): boolean {
        return this.contentSelectorService.drawingService.selectionIsActive;
    }
    initializeResizingStartX(): void {
        this.clearUnderSelection();
        this.resizingStartX = true;
    }
    initializeResizingStartY(): void {
        this.clearUnderSelection();
        this.resizingStartY = true;
    }
    initializeResizingEndX(): void {
        this.clearUnderSelection();
        this.resizingEndX = true;
    }
    initializeResizingEndY(): void {
        this.clearUnderSelection();
        this.resizingEndY = true;
    }
    clearUnderSelection(): void {
        if (!this.contentSelectorService.isResizing) {
            this.contentSelectorService.isResizing = true;
            this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
            this.drawingService.baseCtx.drawImage(this.drawingService.previousCtx.canvas, 0, 0);
            this.contentSelectorService.selectorTool.updatePreviousCtx();
            if (!this.contentSelectorService.firstResizeDone) this.contentSelectorService.selectorTool.clearUnderSelection();
        }
    }
    resizeSelection(event: MouseEvent): void {
        let newStart: Vec2;
        let newEnd: Vec2;
        this.mirrorX = false;
        this.mirrorY = false;

        if (this.resizingStartX) {
            if (event.offsetX > this.contentSelectorService.selectorTool.endPosBeforeResize.x) {
                newStart = { x: this.contentSelectorService.selectorTool.endPosBeforeResize.x, y: this.contentSelectorService.selectorTool.start.y };
                newEnd = { x: event.offsetX, y: this.contentSelectorService.selectorTool.end.y };
                this.mirrorX = true;
            } else {
                newStart = { x: event.offsetX, y: this.contentSelectorService.selectorTool.start.y };
                newEnd = { x: this.contentSelectorService.selectorTool.end.x, y: this.contentSelectorService.selectorTool.end.y };
            }
            this.contentSelectorService.selectorTool.scaleSelection(newStart, newEnd, this.mirrorX, this.mirrorY);
        }
        if (this.resizingStartY) {
            if (event.offsetY > this.contentSelectorService.selectorTool.endPosBeforeResize.y) {
                newStart = { x: this.contentSelectorService.selectorTool.start.x, y: this.contentSelectorService.selectorTool.endPosBeforeResize.y };
                newEnd = { x: this.contentSelectorService.selectorTool.end.x, y: event.offsetY };
                this.mirrorY = true;
            } else {
                newStart = { x: this.contentSelectorService.selectorTool.start.x, y: event.offsetY };
                newEnd = { x: this.contentSelectorService.selectorTool.end.x, y: this.contentSelectorService.selectorTool.end.y };
            }
            this.contentSelectorService.selectorTool.scaleSelection(newStart, newEnd, this.mirrorX, this.mirrorY);
        }
        if (this.resizingEndX) {
            if (event.offsetX < this.contentSelectorService.selectorTool.startPosBeforeResize.x) {
                newStart = { x: event.offsetX, y: this.contentSelectorService.selectorTool.start.y };
                newEnd = { x: this.contentSelectorService.selectorTool.startPosBeforeResize.x, y: this.contentSelectorService.selectorTool.end.y };
                this.mirrorX = true;
            } else {
                newStart = { x: this.contentSelectorService.selectorTool.start.x, y: this.contentSelectorService.selectorTool.start.y };
                newEnd = { x: event.offsetX, y: this.contentSelectorService.selectorTool.end.y };
            }
            this.contentSelectorService.selectorTool.scaleSelection(newStart, newEnd, this.mirrorX, this.mirrorY);
        }
        if (this.resizingEndY) {
            if (event.offsetY < this.contentSelectorService.selectorTool.startPosBeforeResize.y) {
                newStart = { x: this.contentSelectorService.selectorTool.start.x, y: event.offsetY };
                newEnd = { x: this.contentSelectorService.selectorTool.end.x, y: this.contentSelectorService.selectorTool.startPosBeforeResize.y };
                this.mirrorY = true;
            } else {
                newStart = { x: this.contentSelectorService.selectorTool.start.x, y: this.contentSelectorService.selectorTool.start.y };
                newEnd = { x: this.contentSelectorService.selectorTool.end.x, y: event.offsetY };
            }
            this.contentSelectorService.selectorTool.scaleSelection(newStart, newEnd, this.mirrorX, this.mirrorY);
        }
    }
    updatePathDataX(deltaX: number): void {
        if (this.contentSelectorService.selectorTool.name === 'freehand') {
            let lowestX = 9999;
            let lowestXIndex = 0;
            let highestX = 0;
            let highestXIndex = 0;
            for (let i = 0; i < this.contentSelectorService.selectorTool.pathData.length - 1; i++) {
                if (this.contentSelectorService.selectorTool.pathData[i].x < lowestX) {
                    lowestXIndex = i;
                    lowestX = this.contentSelectorService.selectorTool.pathData[i].x;
                }
                if (this.contentSelectorService.selectorTool.pathData[i].x > highestX) {
                    highestXIndex = i;
                    highestX = this.contentSelectorService.selectorTool.pathData[i].x;
                }
            }
            let ankerIndex = 0;
            let startValue = 0;
            if (this.resizingStartX) {
                ankerIndex = highestXIndex;
                startValue = highestX;
            }
            if (this.resizingEndX) {
                ankerIndex = lowestXIndex;
                startValue = lowestX;
            }
            for (let i = 0; i < this.contentSelectorService.selectorTool.pathData.length - 1; i++) {
                if (i !== ankerIndex) {
                    const ratio = (this.contentSelectorService.selectorTool.pathData[i].x - startValue) / (highestX - lowestX);
                    if (this.mirrorX)
                        this.contentSelectorService.selectorTool.pathData[i].x +=
                            Math.abs(ratio) * deltaX - (this.contentSelectorService.selectorTool.pathData[i].x - lowestX);
                    else this.contentSelectorService.selectorTool.pathData[i].x += Math.abs(ratio) * deltaX;
                }
            }
            this.contentSelectorService.selectorTool.pathData[lowestXIndex].x -= 2;
            this.contentSelectorService.selectorTool.pathData[highestXIndex].x += 2;
        }
    }

    updatePathDataY(deltaY: number): void {
        if (this.contentSelectorService.selectorTool.name === 'freehand') {
            let lowestY = 9999;
            let lowestYIndex = 0;
            let highestY = 0;
            let highestYIndex = 0;
            for (let i = 0; i < this.contentSelectorService.selectorTool.pathData.length - 1; i++) {
                if (this.contentSelectorService.selectorTool.pathData[i].y < lowestY) {
                    lowestYIndex = i;
                    lowestY = this.contentSelectorService.selectorTool.pathData[i].y;
                }
                if (this.contentSelectorService.selectorTool.pathData[i].y > highestY) {
                    highestYIndex = i;
                    highestY = this.contentSelectorService.selectorTool.pathData[i].y;
                }
            }
            let ankerIndex;
            let startValue = 0;
            if (this.resizingStartY) {
                ankerIndex = highestYIndex;
                startValue = highestY;
            }
            if (this.resizingEndY) {
                ankerIndex = lowestYIndex;
                startValue = lowestY;
            }
            for (let i = 0; i < this.contentSelectorService.selectorTool.pathData.length - 1; i++) {
                if (i !== ankerIndex) {
                    const ratio = (this.contentSelectorService.selectorTool.pathData[i].y - startValue) / (highestY - lowestY);

                    if (this.mirrorY)
                        this.contentSelectorService.selectorTool.pathData[i].y +=
                            Math.abs(ratio) * deltaY - (this.contentSelectorService.selectorTool.pathData[i].y - lowestY);
                    else this.contentSelectorService.selectorTool.pathData[i].y += Math.abs(ratio) * deltaY;
                }
            }
            this.contentSelectorService.selectorTool.pathData[lowestYIndex].y -= 2;
            this.contentSelectorService.selectorTool.pathData[highestYIndex].y += 2;
        }
    }

    resetBools(): void {
        this.resizingStartX = false;
        this.resizingEndX = false;
        this.resizingStartY = false;
        this.resizingEndY = false;
        this.contentSelectorService.isResizing = false;
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        if (this.contentSelectorService.isResizing) {
            if (this.contentSelectorService.selectorTool.name === 'freehand') this.adjustPathData();

            this.contentSelectorService.selectorTool.updatePreviousCtx();
            this.drawingService.baseCtx.drawImage(this.drawingService.previewCtx.canvas, 0, 0);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.contentSelectorService.firstDragDone = true;
            this.contentSelectorService.selectorTool.startPosBeforeResize = this.contentSelectorService.selectorTool.start;
            this.contentSelectorService.selectorTool.endPosBeforeResize = this.contentSelectorService.selectorTool.end;
            this.contentSelectorService.selectorTool.unchangedSelectedArea.width = this.contentSelectorService.selectorTool.selectedArea.width;
            this.contentSelectorService.selectorTool.unchangedSelectedArea.height = this.contentSelectorService.selectorTool.selectedArea.height;
            (this.contentSelectorService.selectorTool.unchangedSelectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
                this.contentSelectorService.selectorTool.selectedArea,
                0,
                0,
            );
            this.contentSelectorService.selectorTool.redrawSelectedArea();
            this.pushDataToUndo();
        }
        this.resetBools();
    }
    adjustPathData(): void {
        if (this.contentSelectorService.selectorTool.startPosBeforeResize.x - this.contentSelectorService.selectorTool.start.x !== 0)
            this.updatePathDataX(this.contentSelectorService.selectorTool.start.x - this.contentSelectorService.selectorTool.startPosBeforeResize.x);
        else if (this.contentSelectorService.selectorTool.endPosBeforeResize.x - this.contentSelectorService.selectorTool.end.x !== 0)
            this.updatePathDataX(this.contentSelectorService.selectorTool.end.x - this.contentSelectorService.selectorTool.endPosBeforeResize.x);

        if (this.contentSelectorService.selectorTool.startPosBeforeResize.y - this.contentSelectorService.selectorTool.start.y !== 0)
            this.updatePathDataY(this.contentSelectorService.selectorTool.start.y - this.contentSelectorService.selectorTool.startPosBeforeResize.y);
        else if (this.contentSelectorService.selectorTool.endPosBeforeResize.y - this.contentSelectorService.selectorTool.end.y !== 0)
            this.updatePathDataY(this.contentSelectorService.selectorTool.end.y - this.contentSelectorService.selectorTool.endPosBeforeResize.y);

        this.contentSelectorService.selectorTool.pathData[this.contentSelectorService.selectorTool.pathData.length - 1] = {
            x: this.contentSelectorService.selectorTool.pathData[0].x,
            y: this.contentSelectorService.selectorTool.pathData[0].y,
        };
    }

    pushDataToUndo(): void {
        this.data = new Data();
        this.undoRedoService.dataRedoArray = [];
        this.data.name = 'selection';
        this.data.currentTool = this.contentSelectorService;
        this.data.selectedArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.initialArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.finalArea = document.createElement('canvas') as HTMLCanvasElement;

        this.data.initialPosition = {
            x: this.contentSelectorService.selectorTool.startPosBeforeResize.x,
            y: this.contentSelectorService.selectorTool.startPosBeforeResize.y,
        };
        this.data.finalPosition = { x: this.contentSelectorService.selectorTool.start.x, y: this.contentSelectorService.selectorTool.start.y };

        const width = this.contentSelectorService.selectorTool.end.x - this.contentSelectorService.selectorTool.start.x + 1;
        const height = this.contentSelectorService.selectorTool.end.y - this.contentSelectorService.selectorTool.start.y + 1;
        this.data.initialArea.width = width;
        this.data.initialArea.height = height;
        (this.data.initialArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.baseCtx.canvas,
            this.contentSelectorService.selectorTool.startPosBeforeResize.x,
            this.contentSelectorService.selectorTool.startPosBeforeResize.y,
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
            this.contentSelectorService.selectorTool.start.x,
            this.contentSelectorService.selectorTool.start.y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        (this.data.selectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(this.contentSelectorService.selectorTool.selectedArea, 0, 0);

        if (this.contentSelectorService.firstResizeDone) {
            this.undoRedoService.popLastItem();
            this.undoRedoService.pushToArray(this.data);
        } else {
            this.contentSelectorService.firstResizeDone = true;
            this.undoRedoService.pushToArray(this.data);
        }
        this.drawingService.initialPush = true;
        this.data = new Data();
    }
}
