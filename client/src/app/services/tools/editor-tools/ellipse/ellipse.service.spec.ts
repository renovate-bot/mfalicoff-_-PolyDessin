import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from './ellipse.service';

// tslint:disable:no-any
describe('EllipseService', () => {
    let service: EllipseService;
    let mouseEventStart: MouseEvent;
    let mouseEventEnd: MouseEvent;
    let shiftEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let extractCircleSpy: jasmine.Spy<any>;
    let drawPreviewBoxSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawEllipse']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(EllipseService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        extractCircleSpy = spyOn<any>(service, 'extractCircle').and.callThrough();
        drawPreviewBoxSpy = spyOn<any>(service, 'drawPreviewBox').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        // tslint:disable:no-magic-numbers
        // tslint:disable:no-empty
        canvasStub.width = 800;
        canvasStub.height = 1000;
        data = {
            name: 'ellipse',
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

        mouseEventStart = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;

        mouseEventEnd = {
            offsetX: 25,
            offsetY: 35,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;

        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;

        shiftEvent = {
            key: 'Shift',
        } as KeyboardEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 0, y: 0 };
        service.onMouseDown(mouseEventStart);
        expect(service.startXPosition).toEqual(expectedResult.x);
        expect(service.startYPosition).toEqual(expectedResult.y);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventStart);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawRectangle if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseUp(mouseEventStart);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawRectangle if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.onMouseMove(mouseEventStart);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it('onKeyDown should call drawRectangle and should call extractRectangle if mousedown', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.handleKeyDown(shiftEvent);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
        expect(extractCircleSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call draw if mouse is not down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.handleKeyDown(shiftEvent);
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it('onKeyDown should return if not shift', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const randomEvent = {
            key: 'enter',
        } as KeyboardEvent;
        service.handleKeyDown(randomEvent);
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it('onKeyUp should return if not shift', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const randomEvent = {
            key: 'enter',
        } as KeyboardEvent;
        service.handleKeyUp(randomEvent);
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it('onKeyUp should return if not mouse down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.handleKeyUp(shiftEvent);
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it('should if first number is smaller than the other', () => {
        expect(service.getSign(-1)).toBe(-1);
        expect(service.getSign(2)).toBe(1);
    });

    it('onKeyDown should create a cicrcle with smallest side', () => {
        service.mouseDown = true;
        service.extractScaling();
        service.handleKeyDown(shiftEvent);
        expect(service.scaleX).toBe(mouseEventEnd.offsetX / 2);
        expect(service.scaleY).toBe(mouseEventEnd.offsetX / 2);
    });

    it('onMouseMove should call draw', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventEnd);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it('onMouseMove draw a ellipse', () => {
        service.mouseDown = true;
        service.extractScaling();
        service.onMouseDown(mouseEventStart);
        service.onMouseMove(mouseEventEnd);
        expect(service.scaleX).toBe(mouseEventEnd.offsetX / 2);
        expect(service.scaleY).toBe(mouseEventEnd.offsetY / 2);
    });

    it('onMouseMove draw a preview rectangle', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.onMouseMove(mouseEventEnd);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
        expect(drawPreviewBoxSpy).toHaveBeenCalled();
    });

    it('should draw ellipse after releasing shift', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.handleKeyDown(shiftEvent);
        service.onMouseMove(mouseEventEnd);
        service.handleKeyUp(shiftEvent);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
        expect(service.lastScaleX).not.toBe(0);
        expect(service.lastScaleY).not.toBe(0);
    });

    it('should draw ellipse after releasing shift', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.handleKeyDown(shiftEvent);
        service.onMouseMove(mouseEventEnd);
        service.lastCenterX = 5;
        service.lastCenterY = 5;
        service.handleKeyUp(shiftEvent);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it('should change the canvas font size', () => {
        service.changeFontSize(25);
        expect(previewCtxStub.lineWidth).toBe(25);
        expect(baseCtxStub.lineWidth).toBe(25);
    });

    it(' should draw with the normal contour', () => {
        service.currentToolType = 'contour';
        service.onMouseDown(mouseEventStart);
        service.onMouseUp(mouseEventEnd);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it(' onMouseUp should not call darwEllipse if mouseDown is false', () => {
        service.mouseDown = false;
        service.currentToolType = 'contour';
        service.onMouseUp(mouseEventEnd);
        expect(drawServiceSpy.drawEllipse).not.toHaveBeenCalled();
    });

    it(' onMouseUp should not change previousPosition when previousPosition egals endPosition', () => {
        service.currentToolType = 'contour';
        service.onMouseDown(mouseEventStart);
        service.previousEndPositionX = service.endXPosition;
        service.previousEndPositionY = service.endYPosition;
        const endXpos = service.previousEndPositionX;
        const endYpos = service.previousEndPositionY;
        service.onMouseUp(mouseEventStart);

        expect(service.previousEndPositionX).toBe(endXpos);
        expect(service.previousEndPositionY).toBe(endYpos);
    });

    it(' should changle tool type', () => {
        service.currentToolType = 'contour';
        service.changeToolType('plein');
        expect(service.currentToolType).toEqual('plein');
    });

    it('redraw should call drawEllipse of baseCtx when toolPropriety is plein', () => {
        service.redraw(data);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });

    it('redraw should call drawEllipse of baseCtx', () => {
        data.toolPropriety = 'contour';
        service.redraw(data);
        expect(drawServiceSpy.drawEllipse).toHaveBeenCalled();
    });
});
