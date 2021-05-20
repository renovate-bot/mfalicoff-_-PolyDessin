import { TestBed } from '@angular/core/testing';
import { BucketHelper } from './bucket-helper';
import { CanvasTestHelper } from './canvas-test-helper';
import { Vec2 } from './vec2';
// tslint:disable:no-any
// tslint:disable: no-magic-numbers
// tslint:disable:no-empty
describe('BucketHelper', () => {
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });
    it('1 should create an instance', () => {
        expect(new BucketHelper()).toBeTruthy();
    });

    it('2 getPixelColor should return the correct value if coords is in canvas', () => {
        const coords = { x: 25, y: 25 } as Vec2;
        const imageData = new ImageData(200, 200);
        const positionInImageData = (coords.y * imageData.width + coords.x) * 4;
        const arrayToReturn = [
            imageData.data[positionInImageData],
            imageData.data[positionInImageData + 1],
            imageData.data[positionInImageData + 2],
            imageData.data[positionInImageData + 3],
        ];
        const arrayReturned = BucketHelper.getPixelColor(coords, imageData);
        expect(arrayReturned).toEqual(arrayToReturn);
    });

    it('3 getPixelColor should return the default null value if coords is out of canvas', () => {
        const coords = { x: -5, y: -5 } as Vec2;
        const imageData = new ImageData(200, 200);
        const arrayToReturn = [-1, -1, -1, -1];
        const arrayReturned = BucketHelper.getPixelColor(coords, imageData);
        expect(arrayReturned).toEqual(arrayToReturn);
    });

    it('4 getRangeColorTolerance should push the right value in array pixelColorTolerateRange', () => {
        const color = [50, 50, 50, 50] as number[];
        const tolerance = 50;
        const pixelColorRange: number[] = [];
        const arrayToReturn = [0, 178, 0, 178, 0, 178, 0, 178];
        BucketHelper.getRangeColorTolerance(color, tolerance, pixelColorRange);
        expect(pixelColorRange).toEqual(arrayToReturn);
    });

    it('10 getRangeColorTolerance should push the right value in array pixelColorTolerateRange', () => {
        const color = [200, 200, 200, 200] as number[];
        const tolerance = 50;
        const pixelColorRange: number[] = [];
        const arrayToReturn = [72, 255, 72, 255, 72, 255, 72, 255];
        BucketHelper.getRangeColorTolerance(color, tolerance, pixelColorRange);
        expect(pixelColorRange).toEqual(arrayToReturn);
    });

    it('12 isColorInToleratedRange should return true if color is in the range', () => {
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [49, 51, 49, 51, 49, 51, 49, 51];
        const returnValue = BucketHelper.isColorInToloratedRange(color, pixelColorTolerateRange);
        expect(returnValue).toEqual(true);
    });

    it('13 isColorInToleratedRange should return false if color is not in the range', () => {
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [49, 49, 49, 49, 49, 49, 49, 49];
        const returnValue = BucketHelper.isColorInToloratedRange(color, pixelColorTolerateRange);
        expect(returnValue).toEqual(false);
    });

    it('14 changeColorOfPixel should set the value of the pixel to paintColor', () => {
        const paintColor = [50, 50, 50, 50] as number[];
        const imageData = new ImageData(200, 200);
        const position = (25 * imageData.width + 25) * 4;
        BucketHelper.changeColorOfPixel(position, paintColor, imageData);
        const imageDataColor = [imageData.data[position], imageData.data[position + 1], imageData.data[position + 2], imageData.data[position + 3]];
        expect(imageDataColor).toEqual(paintColor);
    });

    it('15 paintWithRightClickOption should call changeColorOfPixel if pixel is in range', () => {
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [49, 51, 49, 51, 49, 51, 49, 51];
        const imageData = new ImageData(200, 200);
        const position = (25 * imageData.width + 25) * 4;
        BucketHelper.changeColorOfPixel(position, color, imageData);
        const colorToPaintWith = [255, 255, 255, 255];
        BucketHelper.paintWithRightClickOption(colorToPaintWith, imageData, pixelColorTolerateRange, baseCtxStub);
        const imageDataColor = [imageData.data[position], imageData.data[position + 1], imageData.data[position + 2], imageData.data[position + 3]];
        expect(imageDataColor).toEqual(colorToPaintWith);
    });

    it('16 paintWithLeftClickOption should call paintPixel and paintRecursive', () => {
        const coords = { x: 25, y: 25 } as Vec2;
        const color = [50, 50, 50, 50] as number[];
        const paintPixelSpy = spyOn<any>(BucketHelper, 'paintPixel');
        const paintPixelRecursiveSpy = spyOn<any>(BucketHelper, 'paintRecursive');
        const imageData = new ImageData(200, 200);
        const pixelColorRange: number[] = [];
        const pixelsStack: Vec2[] = [];
        BucketHelper.paintWithLeftClickOption(coords, color, imageData, pixelColorRange, pixelsStack, baseCtxStub);
        expect(paintPixelSpy).toHaveBeenCalled();
        expect(paintPixelRecursiveSpy).toHaveBeenCalled();
    });

    it('17 paintPixel should call changeColorPixel if colors are not the same and color is in tolerate range', () => {
        const imageData = new ImageData(200, 200);
        const coords = { x: 25, y: 25 } as Vec2;
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [0, 0, 0, 0, 0, 0, 0, 0];
        const pixelsStack: Vec2[] = [];
        const changeColorSpy = spyOn<any>(BucketHelper, 'changeColorOfPixel');
        BucketHelper.paintPixel(coords, color, imageData, pixelColorTolerateRange, pixelsStack);
        expect(changeColorSpy).toHaveBeenCalled();
    });

    it('18 paintPixel should not call changeColorPixel if colors are the same and color is not in tolerate range', () => {
        BucketHelper.visitedPixels[0] = false;
        const imageData = new ImageData(200, 200);
        const coords = { x: 0, y: 0 } as Vec2;
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [1, 1, 1, 1, 1, 1, 1, 1];
        const pixelsStack: Vec2[] = [];
        const changeColorOfPixelSpy = spyOn<any>(BucketHelper, 'changeColorOfPixel');
        BucketHelper.paintPixel(coords, color, imageData, pixelColorTolerateRange, pixelsStack);
        expect(changeColorOfPixelSpy).not.toHaveBeenCalled();
    });

    it('19 paintPixel: if pixel has already been visited, should not call isColorInToloratedRange', () => {
        BucketHelper.visitedPixels[0] = true;
        const imageData = new ImageData(200, 200);
        const coords = { x: 0, y: 0 } as Vec2;
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [1, 1, 1, 1, 1, 1, 1, 1];
        const pixelsStack: Vec2[] = [];
        const isColorInToloratedRangeSpy = spyOn<any>(BucketHelper, 'isColorInToloratedRange');
        BucketHelper.paintPixel(coords, color, imageData, pixelColorTolerateRange, pixelsStack);
        expect(isColorInToloratedRangeSpy).not.toHaveBeenCalled();
    });

    it('20 paintRecursive should call putImageData from baseCtx', () => {
        const pixelsStack: Vec2[] = [];
        pixelsStack.push({ x: 25, y: 25 } as Vec2);
        const imageData = new ImageData(200, 200);
        const color = [50, 50, 50, 50] as number[];
        const pixelColorTolerateRange = [0, 0, 0, 0, 0, 0, 0, 0];
        const paintPixelSpy = spyOn<any>(BucketHelper, 'paintPixel');
        BucketHelper.paintRecursive(color, imageData, pixelColorTolerateRange, pixelsStack, baseCtxStub);
        expect(paintPixelSpy).toHaveBeenCalled();
    });
});
