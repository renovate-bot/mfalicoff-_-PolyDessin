import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleSelectorService } from './rectangle-selector.service';

// tslint:disable:no-magic-numbers
// tslint:disable:no-string-literal
// tslint:disable:max-file-line-count
// tslint:disable:no-empty
// tslint:disable:typedef
describe('RectangleSelectorService', () => {
    let service: RectangleSelectorService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previousCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let mouseEventLeftInsideCanvas: MouseEvent;
    let mouseEventLeftOutsideCanvas: MouseEvent;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });
        service = TestBed.inject(RectangleSelectorService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        previousCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub.canvas.width = 10;
        baseCtxStub.canvas.height = 10;
        previewCtxStub.canvas.width = 10;
        previewCtxStub.canvas.height = 10;
        selectionCtxStub.canvas.width = 10;
        selectionCtxStub.canvas.height = 10;
        previousCtxStub.canvas.width = 10;
        previousCtxStub.canvas.height = 10;
        drawServiceSpy.canvas = canvasTestHelper.canvas;
        drawServiceSpy.canvas.width = 10;
        drawServiceSpy.canvas.height = 10;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectorCtx = previewCtxStub;
        service.drawingService.previousCtx = previewCtxStub;

        mouseEventLeftInsideCanvas = {
            offsetX: 9,
            offsetY: 9,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
        mouseEventLeftOutsideCanvas = {
            offsetX: 15,
            offsetY: 15,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('1 isWidthSmallest: should return true only if width is the smallest', () => {
        expect(service.isWidthSmallest(0, 2)).toBeTrue();
        expect(service.isWidthSmallest(1, 10)).toBeTrue();
        expect(service.isWidthSmallest(100, 2000)).toBeTrue();
        expect(service.isWidthSmallest(2, 0)).toBeFalse();
        expect(service.isWidthSmallest(10, 1)).toBeFalse();
        expect(service.isWidthSmallest(2000, 100)).toBeFalse();
    });
    it('3 invertYCoords: should invert y coordinates', () => {
        service.start.y = 0;
        service.end.y = 10;

        service.invertYCoords();
        expect(service.start.y).toEqual(10);
        expect(service.end.y).toEqual(0);
    });
    it('4 invertXCoords: should invert x coordinates', () => {
        service.start.x = 0;
        service.end.x = 10;

        service.invertXCoords();
        expect(service.start.x).toEqual(10);
        expect(service.end.x).toEqual(0);
    });
    it('5 extractSquare: should invert coordinates if end is bigger than start', () => {
        service.start.x = 5;
        service.start.y = 5;
        service.end.x = 0;
        service.end.y = 0;

        service.extractSquare();
        expect(service.start.x).toEqual(0);
        expect(service.start.y).toEqual(0);
        expect(service.end.x).toEqual(5);
        expect(service.end.y).toEqual(5);
    });
    it('6 extractSquare: should return the smallest dimension', () => {
        service.start.x = 0;
        service.start.y = 0;
        service.end.x = 5;
        service.end.y = 6;

        expect(service.extractSquare()).toEqual({ x: 5, y: 5 });

        service.start.x = 0;
        service.start.y = 0;
        service.end.x = 8;
        service.end.y = 6;

        expect(service.extractSquare()).toEqual({ x: 6, y: 6 });
    });
    it('7 clearUnderSelection: should call the base context clearRect', () => {
        const clearRectSpy = spyOn(drawServiceSpy.baseCtx, 'clearRect');
        service.clearUnderSelection();
        expect(clearRectSpy).toHaveBeenCalled();
    });
    it('8 arrangeCoords: should call extractSquare and change end.x or end.y if shift is pressed', () => {
        const extractSquareSpy = spyOn(service, 'extractSquare').and.callThrough();
        service.start.x = 0;
        service.start.y = 0;
        service.end.x = 5;
        service.end.y = 6;
        service.isShiftPressed = true;
        service.arrangeCoords();
        expect(service.end.y).toEqual(5);
        expect(extractSquareSpy).toHaveBeenCalled();
    });
    it('9 arrangeCoords: should not call extractSquare and change end.x or end.y if shift is not pressed', () => {
        service.start.x = 0;
        service.start.y = 0;
        service.end.x = 5;
        service.end.y = 6;
        service.lastMousePositionX = 8;
        service.lastMousePositionY = 8;
        service.isShiftPressed = false;
        service.arrangeCoords();
        expect(service.end.y).toEqual(8);
        expect(service.end.x).toEqual(8);
    });
    it('10 arrangeCoords: should not call invertXCoords and invertXCoords if x and y coords are inversed', () => {
        service.start.x = 5;
        service.start.y = 6;
        service.end.x = 0;
        service.end.y = 0;
        service.arrangeCoords();
        expect(service.start.x).toEqual(0);
        expect(service.start.y).toEqual(0);
        expect(service.end.x).toEqual(5);
        expect(service.end.y).toEqual(6);
    });
    it('11 onMouseUp: when area is selected, should stay true', () => {
        service.drawingService.areaIsSelected = true;
        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(service.drawingService.areaIsSelected).toBeTruthy();
    });
    it('12 onMouseMove: if new x is in canvas, should change end.x', () => {
        service.end.x = 5;
        service.onMouseMove(mouseEventLeftOutsideCanvas);
        expect(service.end.x).toEqual(5);
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(service.end.x).toEqual(9);
    });
    it('13 onMouseMove: if new y is in canvas, should change end.y', () => {
        service.end.y = 5;
        service.onMouseMove(mouseEventLeftOutsideCanvas);
        expect(service.end.y).toEqual(5);
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(service.end.y).toEqual(9);
    });
    it('14 updateAfterShift: should call arrangeCoords, copyArea, redrawSelectedArea', () => {
        const arrangeCoordsSpy = spyOn(service, 'arrangeCoords');
        const copyAreaSpy = spyOn(service, 'copyArea');
        const redrawSelectedAreaSpy = spyOn(service, 'redrawSelectedArea');
        service.updateAfterShift();
        expect(arrangeCoordsSpy).toHaveBeenCalled();
        expect(copyAreaSpy).toHaveBeenCalled();
        expect(redrawSelectedAreaSpy).toHaveBeenCalled();
    });
    it('15 onMouseUp:should invert coords when end is lower', () => {
        service.start.x = 5;
        service.start.y = 5;
        service.end.x = 4;
        service.end.y = 4;
        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(service.start.x).toEqual(4);
        expect(service.start.y).toEqual(4);
        expect(service.end.x).toEqual(5);
        expect(service.end.y).toEqual(5);
    });
    it('16 redrawSelectedArea:should only call drawImage if selectedArea is not undefined', () => {
        const drawImageSpy = spyOn(drawServiceSpy.previewCtx, 'drawImage');
        service.redrawSelectedArea();
        expect(drawImageSpy).not.toHaveBeenCalled();
        service.selectedArea = document.createElement('canvas') as HTMLCanvasElement;
        service.redrawSelectedArea();
        expect(drawImageSpy).toHaveBeenCalled();
    });
});
