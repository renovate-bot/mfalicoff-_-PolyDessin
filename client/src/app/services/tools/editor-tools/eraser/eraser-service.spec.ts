import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { MouseButton } from '@app/classes/mouse-buttons';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser-service.service';
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('EraserService', () => {
    let service: EraserService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let eraseLineSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EraserService);
        eraseLineSpy = spyOn<any>(service, 'eraseLine').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-empty
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        data = {
            name: 'eraser',
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

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
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

    it('mouseDown should call clearPath if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        expect(eraseLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(eraseLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(eraseLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should put mouseDown to false', () => {
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBe(false);
    });

    it(' onMouseMove should call drawLine if mouse was already down and mouse was not out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseOut = false;

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down and mouse was not out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.mouseOut = false;

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down and mouse was out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.mouseOut = true;

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was already down and mouse was out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseOut = true;

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call clearCanvas if mouseOut is false', () => {
        service.mouseOut = false;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseOut should put mouseOut to true', () => {
        service.onMouseOut(mouseEvent);
        expect(service.mouseOut).toBe(true);
    });

    it('onMouseOver should put mouseOut to false', () => {
        service.onMouseOver(mouseEvent);
        expect(service.mouseOut).toBe(false);
    });

    it(' should change the pixel of the canvas ', () => {
        drawServiceSpy.baseCtx.strokeStyle = 'white';
        mouseEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseUp(mouseEvent);

        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(255); // R
        expect(imageData.data[1]).toEqual(255); // G
        expect(imageData.data[2]).toEqual(255); // B
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('redraw should call lineTo of baseCtx', () => {
        const lineToSpy = spyOn(service['drawingService'].baseCtx, 'lineTo');
        service.redraw(data);
        expect(lineToSpy).toHaveBeenCalled();
    });
});
