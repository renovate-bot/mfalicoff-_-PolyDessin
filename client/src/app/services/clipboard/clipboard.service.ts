import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    imageCopy: HTMLCanvasElement | null = null;
    pathData: Vec2[];
    width: number;
    height: number;
    cutCalled: boolean = false;
    data: Data = new Data();

    constructor(
        private contentSelectorService: ContentSelectorService,
        private drawingService: DrawingService,
        private undoRedoService: UndoRedoService,
    ) {}

    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.code === 'KeyC') {
            this.cutCalled = false;
            this.copy();
        } else if (event.ctrlKey && event.code === 'KeyV') this.paste();
        else if (event.ctrlKey && event.code === 'KeyX') this.cut();
        else if (event.code === 'Delete') {
            this.delete();
            this.contentSelectorService.unselect();
        }
    }

    paste(): void {
        this.translatePathData();

        this.contentSelectorService.firstDragDone = true;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.contentSelectorService.selectorTool.updatePreviousCtx();

        this.drawingService.baseCtx.save();
        if (this.contentSelectorService.selectorTool.name === 'freehand') {
            this.drawingService.baseCtx.beginPath();
            for (const point of this.contentSelectorService.selectorTool.pathData) this.drawingService.baseCtx.lineTo(point.x, point.y);
            this.drawingService.baseCtx.clip();
        }
        this.resetSelectionInitialPosition();

        this.drawOnCanvas();
        this.drawingService.baseCtx.restore();
        this.resetSelection(this.width, this.height);
        this.drawingService.areaIsSelected = true;
        this.contentSelectorService.needToResetSelection = true;
        this.pushDataToUndo('paste');
    }

    delete(): void {
        this.contentSelectorService.selectorTool.clearUnderSelection();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.drawingService.areaIsSelected = false;
        this.drawingService.selectionIsActive = false;
        this.contentSelectorService.needToResetSelection = false;
    }

    cut(): void {
        this.copy();
        this.delete();

        this.cutCalled = true;
        this.pushDataToUndo('cut');
        window.setTimeout(() => {
            this.drawingService.selectionIsActive = false;
        }, Constants.TIMER_DELAY_200);
        // this.contentSelectorService.unselect();
        this.contentSelectorService.selectorTool.updatePreviousCtx();
    }

    copy(): void {
        const selectorStart = this.contentSelectorService.selectorTool.start;
        const selectorEnd = this.contentSelectorService.selectorTool.end;

        this.contentSelectorService.selectorTool.updatePreviousCtx();

        this.imageCopy = document.createElement('canvas');
        const imageData = this.drawingService.baseCtx.getImageData(
            selectorStart.x,
            selectorStart.y,
            selectorEnd.x - selectorStart.x,
            selectorEnd.y - selectorStart.y,
        );
        this.imageCopy.width = imageData.width;
        this.imageCopy.height = imageData.height;

        (this.imageCopy.getContext('2d') as CanvasRenderingContext2D).putImageData(imageData, 0, 0);
        this.width = selectorEnd.x - selectorStart.x;
        this.height = selectorEnd.y - selectorStart.y;
    }

    translatePathData(): void {
        this.pathData = this.contentSelectorService.selectorTool.pathData;
        if (this.pathData.length >= 2) {
            for (const point of this.pathData as Vec2[]) {
                point.x = point.x - this.contentSelectorService.selectorTool.start.x;
                point.y = point.y - this.contentSelectorService.selectorTool.start.y;
            }
        }
        this.contentSelectorService.selectorTool.pathData = this.pathData;
    }

    drawOnCanvas(): void {
        this.drawingService.baseCtx.drawImage(this.imageCopy as HTMLCanvasElement, 0, 0, this.width, this.height);
    }

    resetSelectionInitialPosition(): void {
        this.contentSelectorService.selectorTool.initialPosition.x = this.contentSelectorService.selectorTool.start.x;
        this.contentSelectorService.selectorTool.initialPosition.y = this.contentSelectorService.selectorTool.start.y;
    }

    resetSelection(width: number, height: number): void {
        this.contentSelectorService.selectorTool.start.x = 0;
        this.contentSelectorService.selectorTool.start.y = 0;
        this.contentSelectorService.selectorTool.end.x = width;
        this.contentSelectorService.selectorTool.end.y = height;

        this.drawingService.selectionIsActive = true;
        this.drawingService.areaIsSelected = true;

        this.contentSelectorService.selectorTool.initialPosition.x = 0;
        this.contentSelectorService.selectorTool.initialPosition.y = 0;
        if (this.contentSelectorService.selectorTool.name === 'freehand') {
            this.contentSelectorService.selectorTool.pathData = this.pathData;
            this.contentSelectorService.selectorTool.pathClosed = true;
        }
        this.contentSelectorService.selectorTool.redrawSelectedArea();
    }

    isImageInClipboard(): boolean {
        return this.imageCopy !== null;
    }
    pushDataToUndo(name: string): void {
        this.data = new Data();
        this.undoRedoService.dataRedoArray = [];
        this.data.currentTool = this.contentSelectorService;
        this.data.name = name;
        this.data.selectedArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.initialArea = document.createElement('canvas') as HTMLCanvasElement;
        this.data.finalArea = document.createElement('canvas') as HTMLCanvasElement;

        this.data.initialPosition = { x: this.contentSelectorService.selectorTool.start.x, y: this.contentSelectorService.selectorTool.start.y };
        this.data.finalPosition = {
            x: this.contentSelectorService.selectorTool.start.x,
            y: this.contentSelectorService.selectorTool.start.y,
        };

        const width = this.contentSelectorService.selectorTool.end.x - this.contentSelectorService.selectorTool.start.x + 1;
        const height = this.contentSelectorService.selectorTool.end.y - this.contentSelectorService.selectorTool.start.y + 1;
        this.data.initialArea.width = width;
        this.data.initialArea.height = height;
        (this.data.initialArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.baseCtx.canvas,
            0,
            0,
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
            this.drawingService.baseCtx.canvas,
            this.contentSelectorService.selectorTool.start.x,
            this.contentSelectorService.selectorTool.start.y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        this.data.selectedArea = this.contentSelectorService.selectorTool.selectedArea;
        this.undoRedoService.pushToArray(this.data);
        this.data = new Data();
    }

    reset(): void {
        this.imageCopy = null;
        this.contentSelectorService.unselect();
    }
}
