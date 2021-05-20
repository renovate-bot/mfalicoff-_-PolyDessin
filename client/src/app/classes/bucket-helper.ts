import { Injectable } from '@angular/core';
import { Constants } from '@app/global/constants';
import { Vec2 } from './vec2';

@Injectable({
    providedIn: 'root',
})
export class BucketHelper {
    static visitedPixels: boolean[] = new Array();

    static isPixelInDrawingCanvas(coords: Vec2, imageData: ImageData): boolean {
        return coords.x > 0 && coords.y > 0 && coords.x < imageData.width && coords.y < imageData.height;
    }

    static getPixelColor(coords: Vec2, imageData: ImageData): number[] {
        // on s'assure à chaque fois que le pixel est dans le canvas
        if (this.isPixelInDrawingCanvas(coords, imageData)) {
            const positionInImageDataArray = (coords.y * imageData.width + coords.x) * Constants.PIXEL_LENGTH;
            return [
                imageData.data[positionInImageDataArray], // r
                imageData.data[positionInImageDataArray + 1], // g
                imageData.data[positionInImageDataArray + 2], // b
                imageData.data[positionInImageDataArray + Constants.INDEX_ALPHA], // a
            ];
        } else return Constants.OUT_OF_CANVAS_COLOR_VALUE;
    }

    static getRangeColorTolerance(detectedColor: number[], tolerance: number, pixelColorTolerateRange: number[]): void {
        const colorInterval = Math.round((tolerance / Constants.MAX_TOLERANCE_VALUE) * Constants.MAX_COLOR_DECIMAL_VALUE);
        for (const value of detectedColor) {
            pixelColorTolerateRange.push(value - colorInterval < 0 ? 0 : value - colorInterval); // borne inferieur de chaque composante rgba
            pixelColorTolerateRange.push(
                // borne superieur de chaque composante rgba
                value + colorInterval > Constants.MAX_COLOR_DECIMAL_VALUE ? Constants.MAX_COLOR_DECIMAL_VALUE : value + colorInterval,
            );
        }
    }

    static isColorInToloratedRange(color: number[], pixelColorTolerateRange: number[]): boolean {
        return (
            color[0] >= pixelColorTolerateRange[Constants.INF_RINDEX] &&
            color[0] <= pixelColorTolerateRange[Constants.SUP_RINDEX] &&
            color[1] >= pixelColorTolerateRange[Constants.INF_GINDEX] &&
            color[1] <= pixelColorTolerateRange[Constants.SUP_GINDEX] &&
            color[2] >= pixelColorTolerateRange[Constants.INF_BINDEX] &&
            color[2] <= pixelColorTolerateRange[Constants.SUP_BINDEX] &&
            color[Constants.INDEX_ALPHA] >= pixelColorTolerateRange[Constants.INF_AINDEX] &&
            color[Constants.INDEX_ALPHA] <= pixelColorTolerateRange[Constants.SUP_AINDEX]
        );
    }

    static changeColorOfPixel(position: number, paintColor: number[], imageData: ImageData): void {
        imageData.data[position] = paintColor[0];
        imageData.data[position + 1] = paintColor[1];
        imageData.data[position + 2] = paintColor[2];
        imageData.data[position + Constants.INDEX_ALPHA] = paintColor[Constants.INDEX_ALPHA];
    }

    static paintWithRightClickOption(
        colorToPaintWith: number[],
        imageData: ImageData,
        pixelColorTolerateRange: number[],
        ctx: CanvasRenderingContext2D,
    ): void {
        for (let i = 0; i < imageData.data.length; i += Constants.PIXEL_LENGTH) {
            const currentPixelColor: number[] = [
                imageData.data[i],
                imageData.data[i + 1],
                imageData.data[i + 2],
                imageData.data[i + Constants.INDEX_ALPHA],
            ];
            if (this.isColorInToloratedRange(currentPixelColor, pixelColorTolerateRange)) this.changeColorOfPixel(i, colorToPaintWith, imageData);
            else continue;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    static paintWithLeftClickOption(
        coords: Vec2,
        paintColor: number[],
        imageData: ImageData,
        pixelColorTolerateRange: number[],
        pixelsStack: Vec2[],
        ctx: CanvasRenderingContext2D,
    ): void {
        this.visitedPixels = new Array(imageData.data.length / Constants.PIXEL_LENGTH);
        for (let i = 0; i < this.visitedPixels.length; i++) {
            this.visitedPixels[i] = false;
        }
        this.paintPixel(coords, paintColor, imageData, pixelColorTolerateRange, pixelsStack);
        this.paintRecursive(paintColor, imageData, pixelColorTolerateRange, pixelsStack, ctx);
    }

    static paintPixel(coords: Vec2, paintColor: number[], imageData: ImageData, pixelColorTolerateRange: number[], pixelsStack: Vec2[]): void {
        // verifie si le pixel a deja ete visite en comparant les couleurs
        const positionInImageDataArray = (coords.y * imageData.width + coords.x) * Constants.PIXEL_LENGTH;
        if (!this.visitedPixels[positionInImageDataArray / Constants.PIXEL_LENGTH]) {
            if (this.isColorInToloratedRange(this.getPixelColor(coords, imageData), pixelColorTolerateRange)) {
                this.visitedPixels[positionInImageDataArray / Constants.PIXEL_LENGTH] = true;
                this.changeColorOfPixel(positionInImageDataArray, paintColor, imageData);
                const leftNeighbour = { x: coords.x - 1, y: coords.y } as Vec2;
                const rightNeighbour = { x: coords.x + 1, y: coords.y } as Vec2;
                const upNeighbour = { x: coords.x, y: coords.y - 1 } as Vec2;
                const bottomNeighbour = { x: coords.x, y: coords.y + 1 } as Vec2;
                pixelsStack.push(leftNeighbour, rightNeighbour, upNeighbour, bottomNeighbour);
            }
        }
    }

    static paintRecursive(
        paintColor: number[],
        imageData: ImageData,
        pixelColorTolerateRange: number[],
        pixelsStack: Vec2[],
        ctx: CanvasRenderingContext2D,
    ): void {
        while (pixelsStack.length > 0) {
            const pixel = pixelsStack.pop() as Vec2;
            this.paintPixel(pixel, paintColor, imageData, pixelColorTolerateRange, pixelsStack);
        }

        ctx.putImageData(imageData, 0, 0);
    }
}
