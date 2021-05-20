import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    stampSize: number = Constants.MIN_STAMP_SIZE;
    rotationAngle: number = 0;
    sliderAngleValue: number = Constants.STAMP_ROTATION;
    tempSliderAngleValue: number = 0;
    positionX: number = 0;
    positionY: number = 0;
    private data: Data = new Data();
    altIsPress: boolean = false;
    img: HTMLImageElement = new Image();
    imgName: string = '';
    stamp1: string = 'stamp1';
    stamp2: string = 'stamp2';
    stamp3: string = 'stamp3';
    stamp4: string = 'stamp4';
    stamp5: string = 'stamp5';

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'stamp';
    }

    selectStampImg(imageName: string): void {
        this.img = new Image();
        this.img.src = `assets/toolbar/stamp/${imageName}.png`;
    }

    initialiseRotationAngle(): void {
        this.sliderAngleValue = Constants.STAMP_ROTATION;
        this.rotationAngle = 0;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.save();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.positionX = this.mouseDownCoord.x;
        this.positionY = this.mouseDownCoord.y;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawRotation(this.drawingService.previewCtx, this.rotationAngle, this.stampSize, {
            x: this.positionX,
            y: this.positionY,
        } as Vec2);
        this.drawingService.previewCtx.restore();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.positionX = this.mouseDownCoord.x;
        this.positionY = this.mouseDownCoord.y;
        this.undoRedoService.dataRedoArray = [];
        this.data = new Data();
        this.data.currentTool = this;
        this.data.initialPosition = { x: this.positionX, y: this.positionY } as Vec2;
        this.data.imageStamp = this.imgName;
        this.data.rotationAngle = this.rotationAngle;
        this.data.stampSize = this.stampSize;
        this.undoRedoService.pushToArray(this.data as Data);
        this.drawingService.baseCtx.drawImage(this.drawingService.previewCtx.canvas, 0, 0);
    }

    drawRotation(ctx: CanvasRenderingContext2D, angle: number, stampSize: number, position: Vec2): void {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate((-angle * Math.PI) / Constants.HALF_CIRCLE_DEGREE);
        ctx.drawImage(this.img, -stampSize / 2, -stampSize / 2, stampSize, stampSize);
        ctx.restore();
    }

    rotateImg(wheelEvent: WheelEvent): void {
        this.drawingService.previewCtx.clearRect(0, 0, this.drawingService.previewCtx.canvas.width, this.drawingService.previewCtx.canvas.height);
        if (this.altIsPress) {
            if (wheelEvent.deltaY < 0) {
                this.rotationAngle -= 1;
                this.drawRotation(this.drawingService.previewCtx, this.rotationAngle, this.stampSize, {
                    x: this.positionX,
                    y: this.positionY,
                } as Vec2);
            } else {
                this.rotationAngle += 1;
                this.drawRotation(this.drawingService.previewCtx, this.rotationAngle, this.stampSize, {
                    x: this.positionX,
                    y: this.positionY,
                } as Vec2);
            }
        } else if (wheelEvent.deltaY < 0) {
            this.rotationAngle -= this.sliderAngleValue;
            this.drawRotation(this.drawingService.previewCtx, this.rotationAngle, this.stampSize, {
                x: this.positionX,
                y: this.positionY,
            } as Vec2);
        } else {
            this.rotationAngle += this.sliderAngleValue;
            this.drawRotation(this.drawingService.previewCtx, this.rotationAngle, this.stampSize, {
                x: this.positionX,
                y: this.positionY,
            } as Vec2);
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Alt' && !this.altIsPress) {
            event.preventDefault();
            this.altIsPress = true;
            this.tempSliderAngleValue = this.sliderAngleValue;
            this.sliderAngleValue = 1;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            event.preventDefault();
            this.altIsPress = false;
            this.sliderAngleValue = this.tempSliderAngleValue;
        }
    }

    redraw(data: Data): void {
        this.selectStampImg(data.imageStamp);
        this.drawRotation(this.drawingService.baseCtx, data.rotationAngle, data.stampSize, data.initialPosition);
    }

    initTool(): void {
        this.clearForTool();
        this.imgName = 'stamp1';
        this.selectStampImg(this.imgName);
        this.stampSize = Constants.MIN_STAMP_SIZE;
        this.sliderAngleValue = Constants.STAMP_ROTATION;
        this.rotationAngle = 0;
    }
}
