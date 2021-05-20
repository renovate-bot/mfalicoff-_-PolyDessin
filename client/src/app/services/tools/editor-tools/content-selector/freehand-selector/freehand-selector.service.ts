import { Injectable } from '@angular/core';
import { Selector } from '@app/classes/selector';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class FreeHandSelectorService extends Selector {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.name = 'freehand';
        this.pathData = [];
    }
    onMouseMove(event: MouseEvent): void {
        if (!this.pathClosed) {
            if (!this.isPathValid(this.getPositionFromMouse(event))) {
                this.drawingService.selectorCtx.strokeStyle = 'red';
            } else this.drawingService.selectorCtx.strokeStyle = 'grey';
            this.pathData.push(this.getPositionFromMouse(event));
            this.drawLine(this.drawingService.selectorCtx);
            this.pathData.pop();
        }
    }
    onMouseUp(event: MouseEvent): void {
        const click = this.getPositionFromMouse(event);
        if (!this.pathClosed && this.isPathValid(this.getPositionFromMouse(event))) {
            if (this.pathData.length >= 2 && this.clickIsCloseToOrigin(click)) {
                click.x = this.pathData[0].x;
                click.y = this.pathData[0].y;
                this.pathClosed = true;
                this.drawingService.isDrawing = false;
                this.drawingService.selectionIsActive = true;
                this.updateBoundingRectangle();

                this.copyArea();
                this.redrawSelectedArea();
            }
            this.pathData.push(click);
            this.drawLine(this.drawingService.selectorCtx);
        }
        if (this.pathClosed) {
            this.updatePreviousCtx();
        }
    }
    redrawSelectedArea(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        const width = this.end.x - this.start.x;
        const height = this.end.y - this.start.y;
        this.drawingService.previewCtx.drawImage(this.selectedArea, this.start.x, this.start.y, width, height);
        this.drawingService.selectorCtx.strokeRect(this.start.x, this.start.y, width, height);
    }
    clearUnderSelection(): void {
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.beginPath();
        for (const point of this.pathData) this.drawingService.baseCtx.lineTo(point.x, point.y);
        this.drawingService.baseCtx.clip();
        this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.width, this.drawingService.height);
        this.drawingService.baseCtx.restore();
    }

    resetSelector(): void {
        this.pathClosed = false;
        this.pathData = [];
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
    }

    drawLine(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        ctx.beginPath();
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
    updatePathData(deltaX: number, deltaY: number): void {
        for (const pathData of this.pathData) {
            pathData.x += deltaX;
            pathData.y += deltaY;
        }
    }

    clickIsCloseToOrigin(click: Vec2): boolean {
        return (
            Math.abs(this.pathData[0].x - click.x) <= Constants.SELECTION_CLICK_PADDING &&
            Math.abs(this.pathData[0].y - click.y) <= Constants.SELECTION_CLICK_PADDING
        );
    }
    updateBoundingRectangle(): void {
        this.start.x = this.pathData[0].x;
        this.start.y = this.pathData[0].y;
        this.end.x = this.pathData[0].x;
        this.end.y = this.pathData[0].y;
        for (let i = 1; i < this.pathData.length; i++) {
            if (this.start.x > this.pathData[i].x) this.start.x = this.pathData[i].x;
            if (this.start.y > this.pathData[i].y) this.start.y = this.pathData[i].y;
            if (this.end.x < this.pathData[i].x) this.end.x = this.pathData[i].x;
            if (this.end.y < this.pathData[i].y) this.end.y = this.pathData[i].y;
        }
        this.initialPosition.x = this.start.x;
        this.initialPosition.y = this.start.y;
        this.startPosBeforeResize.x = this.start.x;
        this.startPosBeforeResize.y = this.start.y;
        this.endPosBeforeResize.x = this.end.x;
        this.endPosBeforeResize.y = this.end.y;
    }
    isPathValid(newPos: Vec2): boolean {
        if (this.pathData.length < Constants.SELECTION_MINIMUM_PATH_LENGTH) return true;
        if (newPos.x < 0 || newPos.y < 0 || newPos.x > this.drawingService.canvas.width || newPos.y > this.drawingService.canvas.height) return false;
        let pathCrosses = false;
        let pathOutside = false;
        this.drawingService.selectorCtx.save();
        this.drawingService.selectorCtx.beginPath();
        for (const point of this.pathData) this.drawingService.selectorCtx.lineTo(point.x, point.y);
        this.drawingService.selectorCtx.lineTo(this.pathData[0].x, this.pathData[0].y);
        this.drawingService.selectorCtx.closePath();
        const m = (newPos.y - this.pathData[this.pathData.length - 1].y) / (newPos.x - this.pathData[this.pathData.length - 1].x);
        const b = m * -newPos.x + newPos.y;
        const dX = Math.abs(this.pathData[this.pathData.length - 1].x - newPos.x);
        const minX = Math.min(this.pathData[this.pathData.length - 1].x, newPos.x);
        for (let x = minX + 1; x < minX + dX; x++) {
            const y = m * x + b;
            if (this.drawingService.selectorCtx.isPointInPath(x, y)) pathCrosses = true;
            else pathOutside = true;
        }
        this.drawingService.selectorCtx.restore();
        return !(pathCrosses && pathOutside);
    }
    removePoint(): void {
        if (!this.pathClosed) {
            this.pathData.pop();
            this.drawLine(this.drawingService.selectorCtx);
        }
    }
}
