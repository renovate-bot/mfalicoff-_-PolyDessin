import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers

describe('ClipboardService', () => {
    let service: ClipboardService;
    const drawingService = new DrawingService();
    const contentSelector = new ContentSelectorService(drawingService, new ColorService(drawingService), new UndoRedoService(drawingService));

    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectorCtxSpy: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingService },
                { provide: ContentSelectorService, useValue: contentSelector },
            ],
        });
        service = TestBed.inject(ClipboardService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        selectorCtxSpy = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectorCtx = selectorCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['contentSelectorService'].selectorTool.selectedArea = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('1. should set cut called and call copy on keyDown', () => {
        const copySpy = spyOn(service, 'copy');
        const copyKeyDown = {
            code: 'KeyC',
            ctrlKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(copyKeyDown);
        expect(copySpy).toHaveBeenCalled();
        expect(service.cutCalled).toEqual(false);
    });

    it('2. should set cut called and call paste on keyDown', () => {
        const pasteCopy = spyOn(service, 'paste');
        const pasteKeyDown = {
            code: 'KeyV',
            ctrlKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(pasteKeyDown);
        expect(pasteCopy).toHaveBeenCalled();
    });

    it('3. should set cut called and call cut on keyDown', () => {
        const cutSpy = spyOn(service, 'cut');
        const cutKeyDown = {
            code: 'KeyX',
            ctrlKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(cutKeyDown);
        expect(cutSpy).toHaveBeenCalled();
    });

    it('4. should set cut called and call delete on keyDown', () => {
        const deleteSpy = spyOn(service, 'delete');
        const deleteKeyDown = {
            code: 'Delete',
        } as KeyboardEvent;
        service.handleKeyDown(deleteKeyDown);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('5. should call correct methods for delete', () => {
        const underSpy = spyOn(contentSelector.selectorTool, 'clearUnderSelection');
        const clearCanvasSpy = spyOn(drawingService, 'clearCanvas');

        service.delete();
        expect(underSpy).toHaveBeenCalled();
        expect(clearCanvasSpy).toHaveBeenCalled();
    });

    it('6. should call correct methods for cut', () => {
        const copySpy = spyOn(service, 'copy');
        const deleteSpy = spyOn(service, 'delete');
        const updatePrevSpy = spyOn(contentSelector.selectorTool, 'updatePreviousCtx');
        jasmine.clock().install();
        service.cut();
        jasmine.clock().tick(200);
        jasmine.clock().uninstall();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
        expect(updatePrevSpy).toHaveBeenCalled();
        expect(service.cutCalled).toEqual(true);
    });

    it('7. should translate points if pathData', () => {
        contentSelector.selectorTool.pathData = [
            { x: 55, y: 55 },
            { x: 55, y: 55 },
            { x: 55, y: 55 },
        ];
        contentSelector.selectorTool.start.x = 40;
        contentSelector.selectorTool.start.y = 40;
        service.translatePathData();

        expect(service.pathData).toEqual([
            { x: 15, y: 15 },
            { x: 15, y: 15 },
            { x: 15, y: 15 },
        ]);
    });

    it('8. should not translate points if not pathData', () => {
        contentSelector.selectorTool.pathData = [];
        contentSelector.selectorTool.start.x = 40;
        contentSelector.selectorTool.start.y = 40;
        service.translatePathData();
        expect(service.pathData).toEqual([]);
    });

    it('9. should call drawImage on drwOnCanvas', () => {
        const drawSpy = spyOn(service['drawingService'].baseCtx, 'drawImage');
        service.drawOnCanvas();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('10. should reset initial postions to correct value', () => {
        contentSelector.selectorTool.start.x = 40;
        contentSelector.selectorTool.start.y = 40;

        service.resetSelectionInitialPosition();
        expect(contentSelector.selectorTool.initialPosition).toEqual({ x: 40, y: 40 });
    });

    it('12. should return if imageCopy is null', () => {
        service.imageCopy = null;
        expect(service.isImageInClipboard()).toEqual(false);

        service.imageCopy = document.createElement('canvas');
        expect(service.isImageInClipboard()).toEqual(true);
    });

    it('13. calling copy should call get image data and set values', () => {
        const updatePreviousSpy = spyOn(service['contentSelectorService'].selectorTool, 'updatePreviousCtx');
        service['contentSelectorService'].selectorTool.start = { x: 10, y: 10 };
        service['contentSelectorService'].selectorTool.end = { x: 50, y: 50 };
        service.copy();

        expect((service.imageCopy as HTMLCanvasElement).width).toEqual(40);
        expect((service.imageCopy as HTMLCanvasElement).height).toEqual(40);
        expect(updatePreviousSpy).toHaveBeenCalled();
        expect(service.imageCopy).toBeTruthy();
        expect(service.width).toEqual(40);
        expect(service.height).toEqual(40);
    });

    it('14. calling paste should call put image data and set values', () => {
        spyOn(service, 'translatePathData');
        spyOn(service['contentSelectorService'].selectorTool, 'updatePreviousCtx');
        spyOn(service, 'resetSelectionInitialPosition');
        const clearSpy = spyOn(service['drawingService'], 'clearCanvas');
        const drawSpy = spyOn(service, 'drawOnCanvas');

        service['contentSelectorService'].selectorTool.name = 'rectangle';
        service.paste();

        expect(clearSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('15. calling paste should call put image data and set values with pathData', () => {
        spyOn(service, 'translatePathData');
        spyOn(service['contentSelectorService'].selectorTool, 'updatePreviousCtx');
        spyOn(service, 'resetSelectionInitialPosition');
        const clearSpy = spyOn(service['drawingService'], 'clearCanvas');
        const drawSpy = spyOn(service, 'drawOnCanvas');

        service['contentSelectorService'].selectorTool.name = 'freehand';
        service['contentSelectorService'].selectorTool.pathData = [
            { x: 10, y: 15 },
            { x: 20, y: 15 },
            { x: 30, y: 15 },
        ];

        service.paste();

        expect(clearSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('5. should return if unknown keydown', () => {
        const deleteSpy = spyOn(service, 'delete');
        const copyPaste = spyOn(service, 'copy');
        const pasteSpy = spyOn(service, 'paste');
        const cutSpy = spyOn(service, 'cut');
        const deleteKeyDown = {
            code: 'keyG',
        } as KeyboardEvent;
        service.handleKeyDown(deleteKeyDown);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(copyPaste).not.toHaveBeenCalled();
        expect(pasteSpy).not.toHaveBeenCalled();
        expect(cutSpy).not.toHaveBeenCalled();
    });

    it('6. reset should reset', () => {
        const spyUnselect = spyOn(service['contentSelectorService'], 'unselect');
        service.reset();
        expect(service.imageCopy).toEqual(null);
        expect(spyUnselect).toHaveBeenCalled();
    });
});
