import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FreeHandSelectorService } from './freehand-selector.service';

describe('FreehandSelectorService', () => {
    let service: FreeHandSelectorService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previousCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let mouseEventLeftInsideCanvas: MouseEvent;
    // tslint:disable: no-magic-numbers
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });
        service = TestBed.inject(FreeHandSelectorService);
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
        service.drawingService.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service.drawingService.previewCtx = previewCtxStub;
        service.drawingService.selectorCtx = previewCtxStub;
        service.drawingService.previousCtx = previewCtxStub;

        mouseEventLeftInsideCanvas = {
            offsetX: 9,
            offsetY: 9,
            button: 0,
            // tslint:disable-next-line: no-empty
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('1 onMouseMove: if path is not closed, should call drawLine', () => {
        service.pathClosed = true;
        const drawLineSpy = spyOn(service, 'drawLine');
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(drawLineSpy).not.toHaveBeenCalled();
        service.pathClosed = false;
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(drawLineSpy).toHaveBeenCalled();
    });
    it('2 onMouseMove: if path is valid, should set strokestyle to grey, if not valid, should set to red', () => {
        const isPathValidSpy = spyOn(service, 'isPathValid').and.callFake(() => {
            return true;
        });
        service.pathClosed = false;
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(drawServiceSpy.selectorCtx.strokeStyle).toEqual('#808080');
        isPathValidSpy.and.callFake(() => {
            return false;
        });
        service.onMouseMove(mouseEventLeftInsideCanvas);
        expect(drawServiceSpy.selectorCtx.strokeStyle).toEqual('#ff0000');
    });
    it('3 onMouseUp: if path is valid and not closed, should call drawLine', () => {
        service.pathClosed = false;
        service.pathData = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        const isPathValidSpy = spyOn(service, 'isPathValid').and.callFake(() => {
            return true;
        });
        const drawLineSpy = spyOn(service, 'drawLine');

        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(isPathValidSpy).toHaveBeenCalled();
    });
    it('4 onMouseUp: if path is valid, not closed, longer than 1 and close to origin, should call redrawSelectedArea', () => {
        service.pathClosed = false;
        service.pathData = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        const isPathValidSpy = spyOn(service, 'isPathValid').and.callFake(() => {
            return true;
        });
        const clickIsCloseToOriginSpy = spyOn(service, 'clickIsCloseToOrigin').and.callFake(() => {
            return true;
        });
        const redrawSelectedAreaSpy = spyOn(service, 'redrawSelectedArea');

        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(redrawSelectedAreaSpy).toHaveBeenCalled();
        expect(isPathValidSpy).toHaveBeenCalled();
        expect(clickIsCloseToOriginSpy).toHaveBeenCalled();
    });
    it('4 onMouseUp: if path is valid, not closed, lower than 2, should not call redrawSelectedArea', () => {
        service.pathClosed = false;
        service.pathData = [{ x: 0, y: 0 }];
        const isPathValidSpy = spyOn(service, 'isPathValid').and.callFake(() => {
            return true;
        });
        const redrawSelectedAreaSpy = spyOn(service, 'redrawSelectedArea');

        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(redrawSelectedAreaSpy).not.toHaveBeenCalled();
        expect(isPathValidSpy).toHaveBeenCalled();
    });
    it('5 onMouseUp: if path is closed, should call updatePreviousCtx', () => {
        service.pathClosed = true;
        const updatePreviousCtxSpy = spyOn(service, 'updatePreviousCtx');

        service.onMouseUp(mouseEventLeftInsideCanvas);
        expect(updatePreviousCtxSpy).toHaveBeenCalled();
    });
    it('6 clearUnderSelection: should call save, restore, clip and clearRect of baseCtx', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const saveSpy = spyOn(drawServiceSpy.baseCtx, 'save');
        const restoreSpy = spyOn(drawServiceSpy.baseCtx, 'restore');
        const clipSpy = spyOn(drawServiceSpy.baseCtx, 'clip');
        const clearRectSpy = spyOn(drawServiceSpy.baseCtx, 'clearRect');
        service.clearUnderSelection();
        expect(saveSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
        expect(clipSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();
    });
    it('7 resetSelector: clearCanvas should be called with previewCtx and selectorCtx', () => {
        service.resetSelector();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(drawServiceSpy.previewCtx);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(drawServiceSpy.selectorCtx);
    });
    it('8 updatePathData: should update every data in pathData', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.updatePathData(2, 2);
        expect(service.pathData[0]).toEqual({ x: 2, y: 2 });
        expect(service.pathData[1]).toEqual({ x: 2, y: 2 });
    });
    it('9 isPathValid: return true of point is valid, false if not', () => {
        service.pathData = [
            { x: 1, y: 1 },
            { x: 1, y: 6 },
            { x: 4, y: 6 },
        ];
        expect(service.isPathValid({ x: -1, y: 2 })).toBeFalsy();
        expect(service.isPathValid({ x: 0, y: 2 })).toBeTruthy();
        expect(service.isPathValid({ x: 2, y: 2 })).toBeTruthy();
    });
    it('10 removePoint: if path data not closed, should call pop', () => {
        const popSpy = spyOn(service.pathData, 'pop');
        service.pathClosed = true;
        service.removePoint();
        expect(popSpy).not.toHaveBeenCalled();
        service.pathClosed = false;
        service.removePoint();
        expect(popSpy).toHaveBeenCalled();
    });
    it('11 updateBoundingRectangle: should set start and end positions', () => {
        service.pathData = [
            { x: 1, y: 1 },
            { x: 0, y: 0 },
            { x: 4, y: 6 },
        ];
        service.updateBoundingRectangle();
        expect(service.start).toEqual({ x: 0, y: 0 });
        expect(service.end).toEqual({ x: 4, y: 6 });
    });

    it('12 adjustPath: should call save, restore, clip and clearRect of baseCtx', () => {
        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const saveSpy = spyOn(drawServiceSpy.baseCtx, 'save');
        const restoreSpy = spyOn(drawServiceSpy.baseCtx, 'restore');
        const clipSpy = spyOn(drawServiceSpy.baseCtx, 'clip');
        const clearRectSpy = spyOn(drawServiceSpy.baseCtx, 'clearRect');
        service.clearUnderSelection();
        expect(saveSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
        expect(clipSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();
    });
});
