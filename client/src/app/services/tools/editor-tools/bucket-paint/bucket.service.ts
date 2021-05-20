import { Injectable } from '@angular/core';
import { BucketHelper } from '@app/classes/bucket-helper';
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
export class BucketService extends Tool {
    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'bucket';
    }
    tolerance: number = 0;
    imageData: ImageData;
    pixelColorTolerateRange: number[] = [];
    pixelsStack: Vec2[] = [];
    paintColor: number[] = [];
    data: Data = new Data();

    changeColorTolerance(newTolerance: number): void {
        this.tolerance = newTolerance;
    }

    onMouseDown(event: MouseEvent): void {
        this.pixelColorTolerateRange = [];
        this.undoRedoService.dataRedoArray = [];
        this.data = new Data();
        this.data.currentTool = this;
        this.data.name = 'bucket';
        this.imageData = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.data.pixelCoord = this.mouseDownCoord;
        const detectedPixelColor = BucketHelper.getPixelColor(this.mouseDownCoord, this.imageData);
        BucketHelper.getRangeColorTolerance(detectedPixelColor, this.tolerance, this.pixelColorTolerateRange);
        this.paintColor = [
            this.colorService.primaryRed,
            this.colorService.primaryGreen,
            this.colorService.primaryBlue,
            this.colorService.primaryOpacity * Constants.MAX_COLOR_DECIMAL_VALUE,
        ];
        this.data.paintColor = this.paintColor;
        this.data.imageData = this.imageData;
        this.data.pixelColorRange = this.pixelColorTolerateRange;
        this.data.pixelsStack = this.pixelsStack;
        if (event.button === MouseButton.Left) {
            this.data.bucketFillType = 'left';
            BucketHelper.paintWithLeftClickOption(
                this.mouseDownCoord,
                this.paintColor,
                this.imageData,
                this.pixelColorTolerateRange,
                this.pixelsStack,
                this.drawingService.baseCtx,
            );
        } else if (event.button === MouseButton.Right) {
            this.data.bucketFillType = 'right';
            BucketHelper.paintWithRightClickOption(this.paintColor, this.imageData, this.pixelColorTolerateRange, this.drawingService.baseCtx);
        }
        this.undoRedoService.pushToArray(this.data);
    }

    redraw(data: Data): void {
        if (data.bucketFillType === 'left') {
            BucketHelper.paintWithLeftClickOption(
                data.pixelCoord,
                data.paintColor,
                data.imageData,
                data.pixelColorRange,
                data.pixelsStack,
                this.drawingService.baseCtx,
            );
        } else {
            BucketHelper.paintWithRightClickOption(data.paintColor, data.imageData, data.pixelColorRange, this.drawingService.baseCtx);
        }
    }
}
