import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { UndoRedoService } from './undo-redo.service';
// tslint:disable: no-magic-numbers

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawRectangle', 'drawEllipse', 'drawPolygon']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(UndoRedoService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        data = {
            currentTool: new PencilService(
                new DrawingService(),
                new ColorService(new DrawingService()),
                new UndoRedoService(new DrawingService()),
            ) as Tool,
            name: 'pencil',
            path: [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
            ] as Vec2[],
            lineWidth: 2,
            diameterSize: 4,
            polygonSideNumber: 5,
            polygonBorderFull: false,
            color: ['red', 'blue'] as string[],
            toolPropriety: 'contour',
            finalPosition: { x: 20, y: 20 } as Vec2,
            initialPosition: { x: 10, y: 10 } as Vec2,
            initialArea: document.createElement('canvas'),
            selectedArea: document.createElement('canvas'),
            finalArea: document.createElement('canvas'),
        } as Data;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('undo should call pop on dataUndoArray when isDrawing is false and dataUndoArray is not empty', () => {
        service['drawingService'].isDrawing = false;
        service['dataUndoArray'].push(data);
        const popSpy = spyOn(service.dataRedoArray, 'push');
        service.undo();
        expect(popSpy).toHaveBeenCalled();
    });

    it('undo should not call pop on dataUndoArray when isDrawing is true', () => {
        service['drawingService'].isDrawing = true;
        service['dataUndoArray'].push(data);
        const pushSpy = spyOn(service.dataRedoArray, 'push');
        service.undo();
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('undo should call push on dataUndoArray when isDrawing is false and dataUndoArray is not empty and data is resize', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'resize';
        service['dataUndoArray'].push(data);
        const pushSpy = spyOn(service.dataRedoArray, 'push');
        service.undo();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('undo should call drawImage if imageFromGallery is not null', () => {
        service['drawingService'].isDrawing = false;
        jasmine.clock().install();
        service.imageFromGallery = new Image();
        const drawImageSpy = spyOn(service['drawingService'].baseCtx, 'drawImage');
        service['dataUndoArray'].push(data);
        service.undo();
        jasmine.clock().tick(100);
        expect(drawImageSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('undo should call drawImage if datatemp name is paste', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'paste';
        service['dataUndoArray'].push(data);
        service['dataUndoArray'].push(data);
        jasmine.clock().install();
        const drawImageSpy = spyOn(service['drawingService'].baseCtx, 'drawImage');
        service.undo();
        jasmine.clock().tick(100);
        expect(drawImageSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('undo should call clearRect if datatemp name is cut', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'cut';
        service['dataUndoArray'].push(data);
        service['dataUndoArray'].push(data);
        jasmine.clock().install();
        const clearRectSpy = spyOn(service['drawingService'].baseCtx, 'clearRect');
        service.undo();
        jasmine.clock().tick(100);
        expect(clearRectSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('undo should call redraw if datatemp name is not cut or paste', () => {
        service['drawingService'].isDrawing = false;
        service['dataUndoArray'].push(data);
        service['dataUndoArray'].push(data);
        jasmine.clock().install();
        const redrawSpy = spyOn(data.currentTool, 'redraw');
        service.undo();
        jasmine.clock().tick(100);
        expect(redrawSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
    it('undo should not call redraw if datatemp name is resize', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'resize';
        service['dataUndoArray'].push(data);
        service['dataUndoArray'].push(data);
        jasmine.clock().install();
        const redrawSpy = spyOn(data.currentTool, 'redraw');
        service.undo();
        jasmine.clock().tick(100);
        expect(redrawSpy).not.toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('redo should call pop on dataUndoArray when isDrawing is false and dataRedoArray is not empty', () => {
        service['drawingService'].isDrawing = false;
        service.dataRedoArray.push(data);
        const pushSpy = spyOn(service['dataUndoArray'], 'push');
        spyOn(data.currentTool, 'redraw');
        service.redo();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('redo should not call pop on dataUndoArray when isDrawing is true', () => {
        service['drawingService'].isDrawing = true;
        service.dataRedoArray.push(data);
        const pushSpy = spyOn(service['dataUndoArray'], 'push');
        service.redo();
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('redo should call push on dataUndoArray when isDrawing is false and dataRedoArray is not empty and data is resize', () => {
        service['drawingService'].isDrawing = false;
        service.dataRedoArray.push(data);
        data.name = 'resize';
        service.dataRedoArray.push(data);
        const pushSpy = spyOn(service['dataUndoArray'], 'push');
        service.redo();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('redo should call clearRect when isDrawing is false and dataRedoArray is not empty and data is selector', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'selector';
        service.dataRedoArray.push(data);
        const clearRectSpy = spyOn(service['drawingService'].baseCtx, 'clearRect');
        service.redo();
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('redo should call drawInage when isDrawing is false and dataRedoArray is not empty and data is paste', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'paste';
        service.dataRedoArray.push(data);
        const drawImageSpy = spyOn(service['drawingService'].baseCtx, 'drawImage');
        service.redo();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('redo should call clearRect when isDrawing is false and dataRedoArray is not empty and data is cut', () => {
        service['drawingService'].isDrawing = false;
        data.name = 'cut';
        service.dataRedoArray.push(data);
        const clearRectSpy = spyOn(service['drawingService'].baseCtx, 'drawImage');
        service.redo();
        expect(clearRectSpy).toHaveBeenCalled();
    });
});
