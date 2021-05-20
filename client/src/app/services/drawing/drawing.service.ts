import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    selectorCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    previousCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    isDrawing: boolean = false;
    selectionIsActive: boolean = false;
    areaIsSelected: boolean = false;
    previewWidth: number = (window.innerWidth - Constants.SIDEBAR_WIDTH_CONST) / 2;
    previewHeight: number = window.innerHeight / 2;
    width: number = (window.innerWidth - Constants.SIDEBAR_WIDTH_CONST) / 2;
    height: number = window.innerHeight / 2;
    selectionWidth: number = window.innerWidth - Constants.SIDEBAR_WIDTH_CONST;
    selectionHeight: number = window.innerHeight;
    initialPush: boolean = true;

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
    clearContext(): void {
        this.baseCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    canvasIsBlank(): boolean {
        const pixels = this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        let isBlank = true;
        for (const i of pixels) if (i !== 0) isBlank = false;
        return isBlank;
    }

    updateSize(width: number, height: number): void {
        this.previewWidth = width;
        this.previewHeight = height;
        this.width = width;
        this.height = height;
    }

    updateCanvasSize(width: number, height: number): void {
        this.baseCtx.canvas.width = width;
        this.baseCtx.canvas.height = height;
        this.previewCtx.canvas.width = width;
        this.previewCtx.canvas.height = height;
        this.selectorCtx.canvas.width = width;
        this.selectorCtx.canvas.height = width;
    }

    drawRectangle(startPosition: Vec2, endPosition: Vec2, typeRectangle: string, colorStroke: string, ctx: CanvasRenderingContext2D): void {
        switch (typeRectangle) {
            case 'contour':
                ctx.strokeRect(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                break;
            case 'plein':
                ctx.fillRect(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                break;
            case 'pleinAvecC':
                ctx.save();
                const color = this.baseCtx.strokeStyle;
                ctx.strokeStyle = colorStroke;
                ctx.fillStyle = color;
                ctx.fillRect(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                ctx.strokeRect(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                this.baseCtx.strokeStyle = color;
                ctx.restore();
                break;
        }
    }

    drawEllipse(scale: Vec2, center: Vec2, typeEllipse: string, colorStroke: string, ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.scale(scale.x, scale.y);
        ctx.arc(center.x, center.y, 1, 0, 2 * Math.PI);
        ctx.restore();
        switch (typeEllipse) {
            case 'contour':
                ctx.stroke();
                break;
            case 'plein':
                ctx.fill();
                break;
            case 'pleinAvecC':
                ctx.save();
                const color = this.baseCtx.strokeStyle;
                ctx.strokeStyle = colorStroke;
                ctx.fillStyle = color;
                ctx.stroke();
                ctx.fill();
                this.baseCtx.strokeStyle = color;
                ctx.restore();
                break;
        }
    }

    getRayon(startXPosition: number, startYPosition: number, endXPosition: number, endYPosition: number): number {
        return Math.min(Math.abs(endXPosition - startXPosition) / 2, Math.abs(endYPosition - startYPosition) / 2);
    }

    drawPreviewCircle(startXPosition: number, startYPosition: number, endXPosition: number, endYPosition: number): void {
        const color = this.baseCtx.strokeStyle;
        this.previewCtx.save();
        this.baseCtx.strokeStyle = 'black';
        this.previewCtx.strokeStyle = 'black';
        this.previewCtx.lineWidth = 1;

        const size = this.getRayon(startXPosition, startYPosition, endXPosition, endYPosition);
        let centerX = (endXPosition - startXPosition) / 2 + startXPosition;
        let centerY = (endYPosition - startYPosition) / 2 + startYPosition;
        centerX = size + startXPosition;
        centerY = size + startYPosition;
        for (let i = 0.0; i <= 2.0; i += Constants.CIRCLE_LINE_POLYGON) {
            this.previewCtx.beginPath();
            this.previewCtx.arc(centerX, centerY, size, Math.PI * i, Math.PI * (i + Constants.CIRCLE_EMPTY_LINE_POLYGON));
            this.previewCtx.stroke();
        }
        this.baseCtx.strokeStyle = color;
        this.previewCtx.strokeStyle = color;
        this.previewCtx.restore();
    }

    // Boucle trouve sur internet
    createPolygon(
        ctx: CanvasRenderingContext2D,
        borderAndFull: boolean,
        startXPosition: number,
        startYPosition: number,
        sideNumber: number,
        endXPosition: number,
        endYPosition: number,
    ): void {
        const size = this.getRayon(startXPosition, startYPosition, endXPosition, endYPosition);
        let centerX = (endXPosition - startXPosition) / 2 + startXPosition;
        let centerY = (endYPosition - startYPosition) / 2 + startYPosition;
        centerX = size + startXPosition;
        centerY = size + startYPosition;

        ctx.moveTo(centerX + size, centerY);
        for (let i = 1; i <= sideNumber; i++) {
            ctx.lineTo(centerX + size * Math.cos((i * 2 * Math.PI) / sideNumber), centerY + size * Math.sin((i * 2 * Math.PI) / sideNumber));
        }
        if (borderAndFull) {
            ctx.fill();
        }
    }

    drawPolygon(
        ctx: CanvasRenderingContext2D,
        typePolygon: string,
        borderAndFull: boolean,
        startXPosition: number,
        startYPosition: number,
        sideNumber: number,
        endXPosition: number,
        endYPosition: number,
        strokeColor: string,
    ): void {
        ctx.lineCap = 'round';
        ctx.beginPath();
        switch (typePolygon) {
            case 'contour':
                this.createPolygon(ctx, borderAndFull, startXPosition, startYPosition, sideNumber, endXPosition, endYPosition);
                ctx.stroke();
                break;
            case 'plein':
                borderAndFull = true;
                this.createPolygon(ctx, borderAndFull, startXPosition, startYPosition, sideNumber, endXPosition, endYPosition);
                ctx.stroke();
                ctx.fill();
                break;
            case 'pleinAvecC':
                borderAndFull = true;
                const color = this.baseCtx.strokeStyle;
                ctx.strokeStyle = strokeColor;
                ctx.fillStyle = color;
                this.createPolygon(ctx, borderAndFull, startXPosition, startYPosition, sideNumber, endXPosition, endYPosition);
                ctx.stroke();
                this.baseCtx.strokeStyle = color;
                this.previewCtx.strokeStyle = color;
                break;
        }
    }
}
