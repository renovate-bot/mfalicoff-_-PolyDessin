import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Selector {
    name: string;
    start: Vec2 = { x: 0, y: 0 };
    end: Vec2 = { x: 0, y: 0 };
    initialPosition: Vec2 = { x: 0, y: 0 };
    startPosBeforeResize: Vec2 = { x: 0, y: 0 };
    endPosBeforeResize: Vec2 = { x: 0, y: 0 };
    resizeStartBeforeShift: Vec2 = { x: 0, y: 0 };
    resizeEndBeforeShift: Vec2 = { x: 0, y: 0 };
    initialArea: HTMLCanvasElement;
    selectedArea: HTMLCanvasElement;
    unchangedSelectedArea: HTMLCanvasElement;
    finalArea: HTMLCanvasElement;
    pathData: Vec2[];

    isShiftPressed: boolean = false;
    pathClosed: boolean = false;
    mirrorX: boolean;
    mirrorY: boolean;

    constructor(public drawingService: DrawingService) {
        this.name = '';
    }
    onMouseDown(x: number, y: number): void {}
    onMouseMove(event: MouseEvent): void {}
    onMouseUp(event: MouseEvent): void {}
    redrawSelectedArea(): void {}
    updateAfterShift(): void {}

    clearUnderSelection(): void {}
    updatePathData(deltaX: number, deltaY: number): void {}
    resetSelector(): void {}
    onEscape(): void {}
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
    updatePreviousCtx(): void {
        this.drawingService.clearCanvas(this.drawingService.previousCtx);
        this.drawingService.previousCtx.drawImage(this.drawingService.baseCtx.canvas, 0, 0);
    }
    copyArea(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectedArea = document.createElement('canvas') as HTMLCanvasElement;
        this.unchangedSelectedArea = document.createElement('canvas') as HTMLCanvasElement;
        this.selectedArea.width = this.end.x - this.start.x + 1;
        this.selectedArea.height = this.end.y - this.start.y + 1;
        this.unchangedSelectedArea.width = this.end.x - this.start.x + 1;
        this.unchangedSelectedArea.height = this.end.y - this.start.y + 1;

        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.fillStyle = '#ffffffff';
        this.drawingService.previewCtx.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);

        this.drawingService.previewCtx.fillStyle = '#000000ff';

        this.drawingService.previewCtx.drawImage(
            this.drawingService.baseCtx.canvas,
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.canvas.height,
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.canvas.height,
        );
        if (this.name === 'freehand') {
            this.drawingService.previewCtx.globalCompositeOperation = 'destination-in';
            this.drawingService.previewCtx.beginPath();
            for (const point of this.pathData) this.drawingService.previewCtx.lineTo(point.x, point.y);
            this.drawingService.previewCtx.lineTo(this.pathData[0].x, this.pathData[0].y);
            this.drawingService.previewCtx.fill();
        }

        (this.selectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.previewCtx.canvas,
            this.start.x,
            this.start.y,
            this.end.x - this.start.x + 1,
            this.end.y - this.start.y + 1,
            0,
            0,
            this.end.x - this.start.x + 1,
            this.end.y - this.start.y + 1,
        );
        (this.unchangedSelectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
            this.drawingService.previewCtx.canvas,
            this.start.x,
            this.start.y,
            this.end.x - this.start.x + 1,
            this.end.y - this.start.y + 1,
            0,
            0,
            this.end.x - this.start.x + 1,
            this.end.y - this.start.y + 1,
        );

        this.drawingService.previewCtx.restore();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    // tslint:disable-next-line: cyclomatic-complexity
    scaleSelection(newStart: Vec2, newEnd: Vec2, mirrorX: boolean, mirrorY: boolean): void {
        let scaleX = 1;
        let scaleY = 1;
        const tempCanvas = document.createElement('canvas') as HTMLCanvasElement;

        tempCanvas.width = newEnd.x - newStart.x;
        tempCanvas.height = newEnd.y - newStart.y;

        if (tempCanvas.width !== 0 && tempCanvas.height !== 0) {
            this.mirrorX = mirrorX;
            this.mirrorY = mirrorY;
            (tempCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(
                this.unchangedSelectedArea,
                0,
                0,
                this.unchangedSelectedArea.width,
                this.unchangedSelectedArea.height,
                0,
                0,
                tempCanvas.width,
                tempCanvas.height,
            );

            this.selectedArea.width = tempCanvas.width;
            this.selectedArea.height = tempCanvas.height;
            if (this.mirrorX) scaleX = Constants.MIRROR_FACTOR;
            if (this.mirrorY) scaleY = Constants.MIRROR_FACTOR;
            if (this.mirrorX) (this.selectedArea.getContext('2d') as CanvasRenderingContext2D).translate(this.selectedArea.width, 0);
            if (this.mirrorY) (this.selectedArea.getContext('2d') as CanvasRenderingContext2D).translate(0, this.selectedArea.height);
            (this.selectedArea.getContext('2d') as CanvasRenderingContext2D).scale(scaleX, scaleY);
            (this.selectedArea.getContext('2d') as CanvasRenderingContext2D).drawImage(
                tempCanvas,
                0,
                0,
                tempCanvas.width,
                tempCanvas.height,
                0,
                0,
                this.selectedArea.width,
                this.selectedArea.height,
            );
        }
        this.start = newStart;
        this.end = newEnd;

        this.redrawSelectedArea();
    }
    removePoint(): void {}

    updateBoundingRectangle(): void {}

    drawLine(ctx: CanvasRenderingContext2D): void {}
}
