import { Injectable } from '@angular/core';
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
export class SprayService extends Tool {
    spraySize: number;
    dropletSize: number;
    emissionSpeed: number;
    mouseDownCoord: Vec2;
    private timer: number;
    private newCoordX: number;
    private newCoordY: number;

    private data: Data = new Data();

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.name = 'spray';
        this.dropletSize = 1;
        this.spraySize = Constants.SPRAY_SIZE;
        this.emissionSpeed = Constants.INITAIL_SPRAY_EMISSON;
    }
    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.isDrawing = true;
        this.undoRedoService.dataRedoArray = [];
        this.clearData();
        this.data.currentTool = this;
        this.data.name = 'spray';
        this.data.dropletSize = this.dropletSize;
        this.data.color.push(this.drawingService.baseCtx.fillStyle as string);
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.drawAerosol(this.drawingService.baseCtx);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseUpCoord = this.getPositionFromMouse(event);
            this.undoRedoService.pushToArray(this.data as Data);
        }
        window.clearInterval(this.timer);
        this.drawingService.isDrawing = false;
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    getRandomPoint(radius: number): Vec2 {
        const randomAngle = Math.random() * (2 * Math.PI);
        const randomRadius = Math.random() * radius;
        return { x: Math.cos(randomAngle) * randomRadius, y: Math.sin(randomAngle) * randomRadius };
    }

    drawAPoint(ctx: CanvasRenderingContext2D): void {
        const offset = this.getRandomPoint(this.spraySize);
        this.newCoordX = this.mouseDownCoord.x + offset.x;
        this.newCoordY = this.mouseDownCoord.y + offset.y;
        this.data.path.push({ x: this.newCoordX, y: this.newCoordY } as Vec2);
        ctx.beginPath();
        ctx.arc(this.newCoordX, this.newCoordY, this.dropletSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    drawAerosol(ctx: CanvasRenderingContext2D): void {
        this.timer = window.setInterval(() => {
            this.drawAPoint(ctx);
        }, Constants.TIMER_DELAY_1000 / (this.emissionSpeed * Constants.INCREASE_FACTOR_EMISSION_SPEED));
    }

    private clearData(): void {
        this.data = new Data();
        this.data.path = [];
    }

    redraw(data: Data): void {
        this.drawingService.baseCtx.fillStyle = data.color[0];
        for (const positions of data.path) {
            this.drawingService.baseCtx.beginPath();
            this.drawingService.baseCtx.arc(positions.x, positions.y, data.dropletSize / 2, 0, Math.PI * 2);
            this.drawingService.baseCtx.fill();
            this.drawingService.baseCtx.closePath();
        }
    }

    initTool(): void {
        this.clearForTool();
        const preCtx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        const baseCtx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const color = `rgb(${this.colorService.primaryRed},${this.colorService.primaryGreen},${this.colorService.primaryBlue},${this.colorService.primaryOpacity})`;
        preCtx.lineWidth = Constants.INITIAL_SPRAY_SIZE;
        baseCtx.lineWidth = Constants.INITIAL_SPRAY_SIZE;
        preCtx.strokeStyle = color;
        baseCtx.strokeStyle = color;
        preCtx.fillStyle = color;
        baseCtx.fillStyle = color;
        baseCtx.lineCap = 'square';
        preCtx.lineCap = 'square';
    }
}
