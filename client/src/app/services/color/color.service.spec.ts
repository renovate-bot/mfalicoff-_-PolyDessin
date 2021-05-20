import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from './color.service';

describe('ColorService', () => {
    let service: ColorService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let color: string;

    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });
        service = TestBed.inject(ColorService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].previewCtx = baseCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setPrimColor should set colorIsPrim to true', () => {
        service.setPrimColor();
        expect(service.colorIsPrim).toBe(true);
    });

    it('setSecColor should set colorIsPrim to false', () => {
        service.setSecColor();
        expect(service.colorIsPrim).toBe(false);
    });

    it('switchColors should change red primary and red secondary color', () => {
        service.switchColors();
        expect(service.redSlider).toBe(service.secondaryRed);
        expect(service.secondaryRed).toBe(service.redSlider);
    });

    it('updateColor should update the color in the context', () => {
        color = '#ffffff';
        service.updateColor(color);
        expect(drawServiceSpy.baseCtx.strokeStyle).toBe(color);
    });
});
