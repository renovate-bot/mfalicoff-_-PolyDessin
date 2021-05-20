import { Injectable } from '@angular/core';
import { Selector } from '@app/classes/selector';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Selector {
    lastMousePositionX: number;
    lastMousePositionY: number;
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.name = 'rectangle';
        this.pathData = [];
    }
    onMouseDown(x: number, y: number): void {
        this.start.x = x;
        this.start.y = y;
        this.end.x = x;
        this.end.y = y;
    }
    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        if (this.getPositionFromMouse(event).x > 0 && this.getPositionFromMouse(event).x < this.drawingService.baseCtx.canvas.width)
            this.end.x = this.getPositionFromMouse(event).x;
        if (this.getPositionFromMouse(event).y > 0 && this.getPositionFromMouse(event).y < this.drawingService.baseCtx.canvas.height)
            this.end.y = this.getPositionFromMouse(event).y;
        this.makeSquare();
        this.drawingService.selectorCtx.strokeRect(this.start.x, this.start.y, this.end.x - this.start.x + 1, this.end.y - this.start.y + 1);
    }
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        if (this.end.x < this.start.x) this.invertXCoords();
        if (this.end.y < this.start.y) this.invertYCoords();
        this.updatePreviousCtx();
        if (!this.drawingService.areaIsSelected) {
            this.startPosBeforeResize = { x: this.start.x, y: this.start.y };
            this.endPosBeforeResize = { x: this.end.x, y: this.end.y };
            this.drawingService.isDrawing = false;
            this.drawingService.selectionIsActive = true;
            this.lastMousePositionX = 0;
            this.lastMousePositionY = 0;
            this.isShiftPressed = false;
            this.arrangeCoords();
            this.copyArea();
            this.redrawSelectedArea();
        }
    }
    redrawSelectedArea(): void {
        this.arrangeCoords();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        const width = this.end.x - this.start.x;
        const height = this.end.y - this.start.y;
        if (this.selectedArea !== undefined) this.drawingService.previewCtx.drawImage(this.selectedArea, this.start.x, this.start.y, width, height);
        this.drawingService.selectorCtx.strokeRect(this.start.x, this.start.y, width, height);
    }
    updateAfterShift(): void {
        this.arrangeCoords();
        this.copyArea();
        this.redrawSelectedArea();
    }

    clearUnderSelection(): void {
        this.drawingService.baseCtx.clearRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
    }

    arrangeCoords(): void {
        if (!this.drawingService.areaIsSelected) {
            if (this.end.x < this.start.x) this.invertXCoords();
            if (this.end.y < this.start.y) this.invertYCoords();
            this.makeSquare();
        }
    }
    makeSquare(): void {
        if (this.isShiftPressed) {
            this.lastMousePositionX = this.end.x;
            this.lastMousePositionY = this.end.y;
            const square = this.extractSquare();
            this.end.x = this.start.x + square.x;
            this.end.y = this.start.y + square.y;
        } else if (this.lastMousePositionX && this.lastMousePositionY) {
            this.end.x = this.lastMousePositionX;
            this.end.y = this.lastMousePositionY;
            this.lastMousePositionX = 0;
            this.lastMousePositionY = 0;
        }
    }

    extractSquare(): Vec2 {
        if (this.end.x < this.start.x) this.invertXCoords();
        if (this.end.y < this.start.y) this.invertYCoords();
        const deltaX = this.end.x - this.start.x;
        const deltaY = this.end.y - this.start.y;
        const newSize = Math.abs(this.isWidthSmallest(deltaX, deltaY) ? deltaX : deltaY);
        this.lastMousePositionX = this.end.x;
        this.lastMousePositionY = this.end.y;
        return { x: newSize, y: newSize };
    }

    isWidthSmallest(first: number, second: number): boolean {
        return Math.abs(first) < Math.abs(second);
    }
    invertXCoords(): void {
        const tempX = this.start.x;
        this.start.x = this.end.x;
        this.end.x = tempX;
    }
    invertYCoords(): void {
        const tempY = this.start.y;
        this.start.y = this.end.y;
        this.end.y = tempY;
    }
}
