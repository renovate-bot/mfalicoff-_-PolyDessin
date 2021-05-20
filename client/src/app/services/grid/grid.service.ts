import { Injectable } from '@angular/core';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    squareDimension: number;
    gridOpacity: number;
    gridIsVisible: boolean = false;

    constructor(public drawingService: DrawingService) {
        this.squareDimension = Constants.INITIAL_SQUARE_DIMENSION;
        this.gridOpacity = Constants.MIN_GRID_OPACITY;
    }

    createGrid(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = `rgba(0,0,0,${this.gridOpacity})`;
        for (let verticalGridPosition = 0; verticalGridPosition <= this.drawingService.width; verticalGridPosition += this.squareDimension) {
            ctx.beginPath();
            ctx.moveTo(verticalGridPosition, 0);
            ctx.lineTo(verticalGridPosition, this.drawingService.height);
            ctx.stroke();
        }
        for (let horizontalGridPosition = 0; horizontalGridPosition <= this.drawingService.height; horizontalGridPosition += this.squareDimension) {
            ctx.beginPath();
            ctx.moveTo(0, horizontalGridPosition);
            ctx.lineTo(this.drawingService.width, horizontalGridPosition);
            ctx.stroke();
        }
    }

    handleKey(event: KeyboardEvent): void {
        if (event.code === 'KeyG' && !event.ctrlKey) {
            this.gridIsVisible = !this.gridIsVisible;
            this.applyGrid();
        }
    }

    applyGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        if (this.gridIsVisible) {
            this.createGrid(this.drawingService.gridCtx);
        }
    }

    changeSquareDimension(event: KeyboardEvent): void {
        if (event.code === 'Equal') {
            this.squareDimension += Constants.SQUARE_DMENSION_CHANGE;
            if (this.squareDimension > Constants.MAX_SQUARE_DIMENSION) {
                this.squareDimension = Constants.MAX_SQUARE_DIMENSION;
            }
            this.applyGrid();
            this.applyGrid();
        }
        if (event.code === 'Minus') {
            this.squareDimension -= Constants.SQUARE_DMENSION_CHANGE;
            if (this.squareDimension < Constants.MIN_SQUARE_DIMENSION) {
                this.squareDimension = Constants.MIN_SQUARE_DIMENSION;
            }
            this.applyGrid();
        }
    }
}
