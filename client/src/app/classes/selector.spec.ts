import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleSelectorService } from '@app/services/tools/editor-tools/content-selector/rectangle-selector/rectangle-selector.service';
import { CanvasTestHelper } from './canvas-test-helper';
// tslint:disable:no-empty
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('Selector', () => {
    let service: RectangleSelectorService;
    let rectangleSelectorStub: RectangleSelectorService;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previousCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let mouseEventLeft: MouseEvent;

    beforeEach(() => {
        drawingStub = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearContext', 'canvasIsBlank']);
        rectangleSelectorStub = new RectangleSelectorService(drawingStub);

        TestBed.configureTestingModule({
            providers: [
                { provide: RectangleSelectorService, useValue: rectangleSelectorStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        });
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
        drawingStub.canvas = canvasTestHelper.canvas;
        drawingStub.canvas.width = 10;
        drawingStub.canvas.height = 10;
        service.unchangedSelectedArea = canvasTestHelper.canvas;
        service.unchangedSelectedArea.width = 5;
        service.unchangedSelectedArea.height = 5;
        service.selectedArea = canvasTestHelper.canvas;
        service.selectedArea.width = 5;
        service.selectedArea.height = 5;
        service.drawingService.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service.drawingService.previewCtx = previewCtxStub;
        service.drawingService.selectorCtx = previewCtxStub;
        service.drawingService.previousCtx = previewCtxStub;

        mouseEventLeft = {
            offsetX: 5,
            offsetY: 5,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' 2 scaleSelection: should always call redrawSelectedArea, and shouls update mirrorX and mirrorY', () => {
        const redrawSelectedAreaSpy = spyOn(service, 'redrawSelectedArea');
        service.scaleSelection({ x: 0, y: 0 }, { x: 0, y: 0 }, false, false);
        service.scaleSelection({ x: 0, y: 0 }, { x: 10, y: 10 }, false, false);
        expect(redrawSelectedAreaSpy).toHaveBeenCalled();
        expect(service.mirrorX).toBeFalsy();
        expect(service.mirrorY).toBeFalsy();

        service.scaleSelection({ x: 0, y: 0 }, { x: 10, y: 10 }, true, true);
        expect(redrawSelectedAreaSpy).toHaveBeenCalled();
        expect(service.mirrorX).toBeTruthy();
        expect(service.mirrorY).toBeTruthy();
    });
    it(' 4 updatePreviousCtx: should call the drawingservice clearCanvas', () => {
        service.copyArea();
        expect(drawingStub.clearCanvas).toHaveBeenCalled();
    });
    it(' 5 getPositionFromMouse: return the event offset', () => {
        expect(service.getPositionFromMouse(mouseEventLeft)).toEqual({ x: 5, y: 5 });
    });
});
