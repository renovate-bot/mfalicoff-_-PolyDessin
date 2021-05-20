import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';

// tslint:disable:no-magic-numbers
// tslint:disable:no-string-literal
// tslint:disable: no-empty
// tslint:disable: typedef
describe('StampService', () => {
    let service: StampService;
    let canvasTestHelper: CanvasTestHelper;
    let mouseEvent: MouseEvent;
    let wheelEventUp: WheelEvent;
    let wheelEventDown: WheelEvent;
    let data: Data;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawRotationSpy: jasmine.Spy;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(StampService);

        drawRotationSpy = spyOn(service, 'drawRotation').and.callThrough();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 50,
            offsetY: 50,
            button: 0,
        } as MouseEvent;

        wheelEventUp = {
            deltaX: 0,
            deltaY: 1,
            deltaZ: 0,
        } as WheelEvent;

        wheelEventDown = {
            deltaX: 0,
            deltaY: -1,
            deltaZ: 0,
        } as WheelEvent;

        data = {
            name: 'stamp',
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

    it('1 should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2 selectStampImg should return the selected image', () => {
        const stamp1 = 'stamp1';
        service.selectStampImg(stamp1);

        expect(service.img.src).toContain(stamp1);
    });

    it('3 onMouseMove should draw the stamp', () => {
        const saveSpy = spyOn(previewCtxStub, 'save');
        const restoreSpy = spyOn(previewCtxStub, 'restore');
        service.positionX = mouseEvent.offsetX;
        service.positionY = mouseEvent.offsetY;
        service.onMouseMove(mouseEvent);

        expect(saveSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRotationSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });

    it('4 onMouseDown should draw the stamp', () => {
        const drawImageSpy = spyOn(baseCtxStub, 'drawImage');
        service.onMouseDown(mouseEvent);

        expect(drawImageSpy).toHaveBeenCalled();
        expect(service.positionX).toEqual(mouseEvent.offsetX);
        expect(service.positionY).toEqual(mouseEvent.offsetY);
    });

    it('5 drawRotation should change the stamp angle', () => {
        const angle = 45;
        const stampSize = 60;
        const saveSpy = spyOn(drawingServiceSpy.baseCtx, 'save');
        const restoreSpy = spyOn(drawingServiceSpy.baseCtx, 'restore');
        const translateSpy = spyOn(drawingServiceSpy.baseCtx, 'translate');
        const rotateSpy = spyOn(drawingServiceSpy.baseCtx, 'rotate');
        const drawImageSpy = spyOn(drawingServiceSpy.baseCtx, 'drawImage');
        service.drawRotation(drawingServiceSpy.baseCtx, angle, stampSize, {
            x: service.positionX,
            y: service.positionY,
        });

        expect(saveSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });

    it('6 rotateImg should rotate the stamp to the left at 1 degree with WheelEvent', () => {
        const newAngle = service.rotationAngle - 1;
        service.altIsPress = true;
        service.rotateImg(wheelEventDown);

        expect(service.rotationAngle).toEqual(newAngle);
        expect(drawRotationSpy).toHaveBeenCalled();
    });

    it('7 rotateImg should rotate the stamp to the right at 1 degree with WheelEvent', () => {
        const newAngle = service.rotationAngle + 1;
        service.altIsPress = true;
        service.rotateImg(wheelEventUp);

        expect(service.rotationAngle).toEqual(newAngle);
        expect(drawRotationSpy).toHaveBeenCalled();
    });

    it('8 rotateImg should rotate the stamp to the left at 15 degree with WheelEvent', () => {
        const newAngle = service.rotationAngle - 15;
        service.altIsPress = false;
        service.rotateImg(wheelEventDown);

        expect(service.rotationAngle).toEqual(newAngle);
        expect(drawRotationSpy).toHaveBeenCalled();
    });

    it('9 rotateImg should rotate the stamp to the right at 15 degree with WheelEvent', () => {
        const newAngle = service.rotationAngle + 15;
        service.altIsPress = false;
        service.rotateImg(wheelEventUp);

        expect(service.rotationAngle).toEqual(newAngle);
        expect(drawRotationSpy).toHaveBeenCalled();
    });

    it('10 handleKeyDown: Alt should set alIsPress to true', () => {
        const alt = {
            key: 'Alt',
            preventDefault() {},
        } as KeyboardEvent;
        service.altIsPress = false;
        service.tempSliderAngleValue = 0;
        service.sliderAngleValue = 60;
        service.handleKeyDown(alt);
        expect(service.altIsPress).toBeTrue();
        expect(service.sliderAngleValue).toEqual(1);
    });
    it('11 handleKeyDown: other key than Alt should do nothing', () => {
        const shift = {
            key: 'Shift',
            preventDefault() {},
        } as KeyboardEvent;
        service.altIsPress = false;
        service.tempSliderAngleValue = 0;
        service.sliderAngleValue = 60;
        service.handleKeyDown(shift);
        expect(service.altIsPress).toBeFalse();
        expect(service.tempSliderAngleValue).toEqual(service.tempSliderAngleValue);
        expect(service.sliderAngleValue).toEqual(service.sliderAngleValue);
    });

    it('12 handleKeyUp: Alt should set alIsPress to false', () => {
        const alt = {
            key: 'Alt',
            preventDefault() {},
        } as KeyboardEvent;
        service.altIsPress = true;
        service.tempSliderAngleValue = 60;
        service.sliderAngleValue = 1;
        service.handleKeyUp(alt);
        expect(service.altIsPress).toBeFalse();
        expect(service.sliderAngleValue).toEqual(service.tempSliderAngleValue);
    });

    it('13 handleKeyUp: other key than Alt should do nothing', () => {
        const shift = {
            key: 'Shift',
            preventDefault() {},
        } as KeyboardEvent;
        service.altIsPress = true;
        service.tempSliderAngleValue = 60;
        service.sliderAngleValue = 1;
        service.handleKeyUp(shift);
        expect(service.altIsPress).toBeTrue();
        expect(service.sliderAngleValue).toEqual(service.sliderAngleValue);
    });

    it('14 initTool should call clearForTool', () => {
        const clearForToolSpy = spyOn(service, 'clearForTool');
        service.initTool();
        expect(clearForToolSpy).toHaveBeenCalled();
    });

    it('15 initialiseRotationAngle set rotation value to the default', () => {
        service.sliderAngleValue = 80;
        service.rotationAngle = 300;
        service.initialiseRotationAngle();
        expect(service.sliderAngleValue).toEqual(Constants.STAMP_ROTATION);
        expect(service.rotationAngle).toEqual(0);
    });

    it('16 onMouseDown should call push from dataUndoArray', () => {
        const pushSpy = spyOn(service.undoRedoService['dataUndoArray'], 'push');
        service.onMouseDown(mouseEvent);
        expect(pushSpy).toHaveBeenCalled();
    });

    it('17 redraw should call arc of baseCtx', () => {
        const selectStampImgSpy = spyOn(service, 'selectStampImg');
        service.redraw(data);
        expect(selectStampImgSpy).toHaveBeenCalled();
        expect(drawRotationSpy).toHaveBeenCalled();
    });
});
