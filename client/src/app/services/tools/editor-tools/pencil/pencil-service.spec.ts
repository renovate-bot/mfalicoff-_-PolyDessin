import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { MouseButton } from '@app/classes/mouse-buttons';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil-service';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let clearSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        clearSpy = spyOn<any>(service, 'clearPath').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-empty
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        data = {
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
            button: MouseButton.Middle,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('mouseDown should call clearPath if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call clearPath', () => {
        service.onMouseUp(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down and if mouse was not out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseOut = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down and if mouse is out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.mouseOut = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down and if mouse is not out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.mouseOut = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was already down and if mouse is out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseOut = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onMouseOut should call drawLine', () => {
        service.onMouseOut(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onMouseOut should call clearPath', () => {
        service.onMouseOut(mouseEvent);
        expect(clearSpy).toHaveBeenCalled();
    });

    it('onMouseOut should put mouseOut to true', () => {
        service.onMouseOut(mouseEvent);
        expect(service.mouseOut).toBe(true);
    });

    it('onMouseOver should put mouseOut to false', () => {
        service.onMouseOver(mouseEvent);
        expect(service.mouseOut).toBe(false);
    });

    // Exemple de test d'intégration qui est quand même utile
    it(' should change the pixel of the canvas ', () => {
        mouseEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseUp(mouseEvent);

        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line:no-magic-numbers
        expect(imageData.data[3]).not.toEqual(0); // A
    });

    it('redraw should call lineTo of baseCtx', () => {
        const lineToSpy = spyOn(service['drawingService'].baseCtx, 'lineTo');
        service.redraw(data);
        expect(lineToSpy).toHaveBeenCalled();
    });
});
