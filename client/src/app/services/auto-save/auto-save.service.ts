import { Injectable } from '@angular/core';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class AutoSaveService {
    constructor(private drawingService: DrawingService, private undoRedoService: UndoRedoService) {}

    isImageStored(): boolean {
        if (localStorage.getItem('image') === null) {
            return false;
        }
        return true;
    }

    loadImage(): void {
        const imageUrl = localStorage.getItem('image');
        const image = new Image();
        image.src = imageUrl as string;
        image.onload = () => {
            this.resetCanvasSize(image);
        };
    }

    resetCanvasSize(image: HTMLImageElement): void {
        setTimeout(() => {
            const ctx = this.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
            this.drawingService.clearCanvas(ctx as CanvasRenderingContext2D);
            this.drawingService.updateCanvasSize(image.width, image.height);
            this.drawingService.baseCtx.drawImage(image, 0, 0);
            this.undoRedoService.resetArrays();
            this.undoRedoService.imageFromGallery = image;
        }, Constants.TIMER_DELAY_200);
        this.drawingService.updateSize(image.width, image.height);
    }

    saveImage(image: string): void {
        localStorage.clear();
        localStorage.setItem('image', image);
    }

    clearImage(): void {
        localStorage.clear();
        this.drawingService.previewWidth = (window.innerWidth - Constants.SIDEBAR_WIDTH_CONST) / 2;
        this.drawingService.previewHeight = window.innerHeight / 2;

        this.drawingService.width = (window.innerWidth - Constants.SIDEBAR_WIDTH_CONST) / 2;
        this.drawingService.height = window.innerHeight / 2;

        this.drawingService.selectionWidth = window.innerWidth - Constants.SIDEBAR_WIDTH_CONST;
        this.drawingService.selectionHeight = window.innerHeight;
    }
}
