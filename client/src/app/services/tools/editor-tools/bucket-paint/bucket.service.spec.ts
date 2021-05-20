import { TestBed } from '@angular/core/testing';
import { BucketHelper } from '@app/classes/bucket-helper';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketService } from './bucket.service';

// tslint:disable:no-any
// tslint:disable: no-magic-numbers
// tslint:disable:no-empty

describe('BucketService', () => {
    let service: BucketService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let getImageSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(BucketService);

        getImageSpy = spyOn<any>(baseCtxStub, 'getImageData');

        service.drawingService.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service.drawingService.previewCtx = previewCtxStub;
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

    it('1 should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2 changeColorTolerance should change the value of local attribut tolerance', () => {
        service.changeColorTolerance(5);
        expect(service.tolerance).toEqual(5);
    });

    it('3 onMouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        spyOn<any>(BucketHelper, 'getPixelColor');
        spyOn<any>(BucketHelper, 'getRangeColorTolerance');
        spyOn<any>(BucketHelper, 'paintWithLeftClickOption');
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('4 onMouseDown should call getImageData from baseCtx', () => {
        spyOn<any>(BucketHelper, 'getPixelColor');
        spyOn<any>(BucketHelper, 'getRangeColorTolerance');
        spyOn<any>(BucketHelper, 'paintWithLeftClickOption');
        service.onMouseDown(mouseEvent);
        expect(getImageSpy).toHaveBeenCalled();
    });

    it('5 onMouseDown should paintWithLeftClickOption when event.button is left', () => {
        spyOn<any>(BucketHelper, 'getPixelColor');
        spyOn<any>(BucketHelper, 'getRangeColorTolerance');
        const paintLeftClickSpy = spyOn<any>(BucketHelper, 'paintWithLeftClickOption');
        service.onMouseDown(mouseEvent);
        expect(paintLeftClickSpy).toHaveBeenCalled();
    });

    it('5 onMouseDown should paintWithRightClickOption when event.button is right', () => {
        spyOn<any>(BucketHelper, 'getPixelColor');
        spyOn<any>(BucketHelper, 'getRangeColorTolerance');
        const paintRightClickSpy = spyOn<any>(BucketHelper, 'paintWithRightClickOption');
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
            preventDefault: () => {},
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(paintRightClickSpy).toHaveBeenCalled();
    });

    it('6 onMouseDown should not call paintWithRightClickOption or paintWithLeftClick when event.button is not left or right', () => {
        spyOn<any>(BucketHelper, 'getPixelColor');
        spyOn<any>(BucketHelper, 'getRangeColorTolerance');
        const paintLeftClickSpy = spyOn<any>(BucketHelper, 'paintWithLeftClickOption');
        const paintRightClickSpy = spyOn<any>(BucketHelper, 'paintWithRightClickOption');
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
            preventDefault: () => {},
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(paintLeftClickSpy).not.toHaveBeenCalled();
        expect(paintRightClickSpy).not.toHaveBeenCalled();
    });

    it('7 redraw should call paintWithLeftClickOption BucketHelper when option is left', () => {
        const paintLeftSpy = spyOn(BucketHelper, 'paintWithLeftClickOption');
        data.bucketFillType = 'left';
        service.redraw(data);
        expect(paintLeftSpy).toHaveBeenCalled();
    });

    it('8 redraw should call paintWithRightClickOption BucketHelper when option is left', () => {
        const paintRightSpy = spyOn(BucketHelper, 'paintWithRightClickOption');
        data.bucketFillType = 'right';
        service.redraw(data);
        expect(paintRightSpy).toHaveBeenCalled();
    });
});
