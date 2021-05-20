import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AutoSaveService } from './auto-save.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
describe('AutoSaveService', () => {
    let service: AutoSaveService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let selectorCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'canvasIsBlank', 'updateSize', 'updateCanvasSize']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['resetArrays']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, undoRedoSpy },
            ],
        });
        service = TestBed.inject(AutoSaveService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectorCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        canvasStub = canvasTestHelper.canvas;

        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectorCtx = selectorCtxStub;
        service['drawingService'].canvas = canvasStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('1. should return true if image', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        expect(service.isImageStored()).toEqual(false);
    });

    it('2. should return false if not image', () => {
        spyOn(localStorage, 'getItem').and.returnValue(' ');
        expect(service.isImageStored()).toEqual(true);
    });

    it('3. should get item from localStorage', () => {
        const storageSpy = spyOn(localStorage, 'getItem').and.returnValue(' ');
        service.loadImage();
        expect(storageSpy).toHaveBeenCalled();
    });

    it('4. should should load image on canvas', () => {
        jasmine.clock().install();
        const spyOnCanvasDraw = spyOn(drawServiceSpy.baseCtx, 'drawImage');
        const imageTest = new Image();
        imageTest.src = '';
        imageTest.width = 500;
        imageTest.height = 500;
        service.resetCanvasSize(imageTest);
        jasmine.clock().tick(200);
        jasmine.clock().uninstall();
        expect(spyOnCanvasDraw).toHaveBeenCalled();
    });

    it('5. should set item to localStorage', () => {
        const storageSpy = spyOn(localStorage, 'setItem');
        const storageSpyClear = spyOn(localStorage, 'clear');
        service.saveImage(' ');
        expect(storageSpyClear).toHaveBeenCalled();
        expect(storageSpy).toHaveBeenCalled();
    });
});
