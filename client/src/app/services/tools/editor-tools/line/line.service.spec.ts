import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';

// tslint:disable:no-any
describe('LineService', () => {
    let service: LineService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let canvasTestHelper: CanvasTestHelper;
    let mouseEvent1: MouseEvent;
    let mouseEvent2: MouseEvent;
    let mouseEvent3: MouseEvent;
    let mouseEventEnd: MouseEvent;
    let canvasStub: HTMLCanvasElement;
    let backspaceEvent: KeyboardEvent;
    let escapeEvent: KeyboardEvent;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let drawLineSpy: jasmine.Spy<any>;
    let drawJunctionSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        service = TestBed.inject(LineService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        drawJunctionSpy = spyOn<any>(service, 'drawJunction').and.callThrough();

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        // Configuration du spy du service
        // tslint:disable:no-string-literal

        // tslint:disable-next-line:no-magic-numbers
        canvasStub.width = 800;
        // tslint:disable-next-line:no-magic-numbers
        canvasStub.height = 1000;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        // tslint:disable:no-magic-numbers
        mouseEvent1 = ({
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as unknown) as MouseEvent;

        mouseEvent2 = ({
            offsetX: 35,
            offsetY: 35,
            button: 0,
        } as unknown) as MouseEvent;

        mouseEvent3 = ({
            offsetX: 200,
            offsetY: 200,
            button: 0,
        } as unknown) as MouseEvent;

        mouseEventEnd = ({
            offsetX: 26,
            offsetY: 26,
            button: 0,
        } as unknown) as MouseEvent;

        backspaceEvent = {
            key: 'Backspace',
        } as KeyboardEvent;

        escapeEvent = {
            key: 'Escape',
        } as KeyboardEvent;

        data = {
            name: 'line',
            path: [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
            ] as Vec2[],
            lineWidth: 2,
            diameterSize: 4,
            polygonSideNumber: 5,
            polygonBorderFull: false,
            color: ['red', 'blue'] as string[],
            toolPropriety: 'plein',
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

    it(' mouseDown should set firstPoint to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onClick(mouseEvent1);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onClick(mouseEvent1);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = ({
            layerX: 25,
            layerY: 25,
            button: 1,
        } as unknown) as MouseEvent;
        service.onClick(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should not call drawLine on First click', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine on subsequent clicks', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine for segment preview', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onMouseMove(mouseEvent2);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' Double Click call drawline and clear path, if not close to start', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        const ret = service.isPointCloseToStart({ x: 200, y: 200 });
        expect(ret).toBe(false);

        service.doubleClick(mouseEvent3);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service.pathData).toEqual([]);
    });

    it(' Double Click call drawline and clear path, and isPointclose to start true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        service.onClick(mouseEvent3);
        const ret = service.isPointCloseToStart({ x: 26, y: 26 });
        expect(ret).toBe(true);

        service.doubleClick(mouseEventEnd);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service.pathData).toEqual([]);
    });

    it(' ligne avec Point should call arc', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.currentToolType = 'avec';

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        service.onClick(mouseEvent3);
        service.doubleClick(mouseEventEnd);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawJunctionSpy).toHaveBeenCalled();
        expect(service.pathData).toEqual([]);
    });

    it(' Escape key should clear the current line', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        service.onClick(mouseEvent3);
        service.handleKeyDown(escapeEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service.pathData).toEqual([]);
    });

    it(' Backspace key should clear the current segment', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onClick(mouseEvent1);
        service.onClick(mouseEvent2);
        service.onClick(mouseEvent3);
        const currentSize = service.pathData.length;
        service.handleKeyDown(backspaceEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service.pathData.length).toEqual(currentSize - 1);
    });

    it(' change font should set canvas line width', () => {
        // tslint:disable:no-magic-numbers
        service.changeFontSize(20);
        expect(baseCtxStub.lineWidth).toBe(20);
        expect(previewCtxStub.lineWidth).toBe(20);
    });

    it(' should change tool', () => {
        service.changeToolType('sans');
        expect(service.currentToolType).toEqual('sans');
    });

    it(' change font should set canvas line width', () => {
        service.changeToolTypePropriety(15);
        expect(service.currentDiameterSize).toEqual(15);
    });

    it(' should return if not mouse down', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent1);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' should return if not a registered key', () => {
        service.mouseDown = true;
        const unknowKey = {
            key: 'enter',
        } as KeyboardEvent;
        service.handleKeyDown(unknowKey);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' should return if backspace and not enough Points', () => {
        service.mouseDown = true;
        service.handleKeyDown(backspaceEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('changeToolTypePropriety should not change if bad value', () => {
        service.mouseDown = true;
        service.currentDiameterSize = 5;
        service.changeToolTypePropriety(-5);
        expect(service.currentDiameterSize).toEqual(5);
    });

    it('redraw should call lineTo of baseCtx', () => {
        const lineToSpy = spyOn(service['drawingService'].baseCtx, 'lineTo');
        service.redraw(data);
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('redraw should call arc of baseCtx', () => {
        const arcSpy = spyOn(service['drawingService'].baseCtx, 'arc');
        data.toolPropriety = 'avec';
        service.redraw(data);
        expect(arcSpy).toHaveBeenCalled();
    });
});
