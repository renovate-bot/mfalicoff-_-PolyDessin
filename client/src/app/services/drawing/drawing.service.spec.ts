import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from './drawing.service';
// tslint:disable: no-magic-numbers

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let startPosition: Vec2;
    let endPosition: Vec2;
    let strokeSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        strokeSpy = spyOn(service.baseCtx, 'stroke');

        startPosition = {
            x: 5,
            y: 5,
        } as Vec2;

        endPosition = {
            x: 10,
            y: 10,
        } as Vec2;
    });

    it('1 should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2 should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });
    it('3 clearContext should set all pixels to white in baseCtx', () => {
        const clearRectSpy = spyOn(service.baseCtx, 'clearRect');
        service.clearContext();
        expect(clearRectSpy).toHaveBeenCalled();
    });
    it('4 canvasIsBlank should return true only if canvas is blank', () => {
        service.clearContext();
        expect(service.canvasIsBlank()).toBeTruthy();
        const pixels = new Uint8ClampedArray(4); // un pixel
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = 255;
        }
        const imgd: ImageData = new ImageData(pixels, 1);
        service.baseCtx.putImageData(imgd, 0, 0);
        expect(service.canvasIsBlank()).toBeFalse();
    });

    it('5 drawRectangle should call strokeRect when typeRectangle is contour', () => {
        const strokeRectSpy = spyOn(service.baseCtx, 'strokeRect');
        service.drawRectangle(startPosition, endPosition, 'contour', 'blue', service.baseCtx);
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('6 drawRectangle should call fillRect when typeRectangle is plein', () => {
        const fillRectSpy = spyOn(service.baseCtx, 'fillRect');
        service.drawRectangle(startPosition, endPosition, 'plein', 'blue', service.baseCtx);
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it('7 drawRectangle should call strokeRect when typeRectangle is pleinAvecC', () => {
        const strokeRectSpy = spyOn(service.baseCtx, 'strokeRect');
        service.drawRectangle(startPosition, endPosition, 'pleinAvecC', 'blue', service.baseCtx);
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('8 drawEllipse should call stroke when typeEllipse is contour', () => {
        service.drawEllipse(startPosition, endPosition, 'contour', 'blue', service.baseCtx);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('9 drawEllipse should call fill when typeEllipse is plein', () => {
        const fillSpy = spyOn(service.baseCtx, 'fill');
        service.drawEllipse(startPosition, endPosition, 'plein', 'blue', service.baseCtx);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('10 drawEllipse should call stroke when typeEllipse is contour', () => {
        service.drawEllipse(startPosition, endPosition, 'pleinAvecC', 'blue', service.baseCtx);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('11 drawPreviewCircle should call arc', () => {
        const arcSpy = spyOn(service.previewCtx, 'arc');

        service.drawPreviewCircle(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
        expect(arcSpy).toHaveBeenCalledTimes(20);
    });

    it('12 createPolygon should call lineTo', () => {
        const lineToSpy = spyOn(service.baseCtx, 'lineTo');
        service.createPolygon(service.baseCtx, false, startPosition.x, startPosition.y, 5, endPosition.x, endPosition.y);
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('13 createPolygon should call fill when borderAndFull is true', () => {
        const fillSpy = spyOn(service.baseCtx, 'fill');
        service.createPolygon(service.baseCtx, true, startPosition.x, startPosition.y, 5, endPosition.x, endPosition.y);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('14 drawPolygon should call stroke when curentToolType is contour', () => {
        service.drawPolygon(service.baseCtx, 'contour', false, startPosition.x, startPosition.y, 5, endPosition.x, endPosition.y, 'black');
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('15 drawPolygon should call stroke when curentToolType is plein', () => {
        service.drawPolygon(service.baseCtx, 'plein', false, startPosition.x, startPosition.y, 5, endPosition.x, endPosition.y, 'black');
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('16 drawPolygon should call stroke when curentToolType is pleinAvecC', () => {
        service.drawPolygon(service.baseCtx, 'pleinAvecC', false, startPosition.x, startPosition.y, 5, endPosition.x, endPosition.y, 'black');
        expect(strokeSpy).toHaveBeenCalled();
    });
});
