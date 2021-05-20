import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorOpacityComponent } from './color-opacity.component';

const RED = 255;
const GREEN = 255;
const BLUE = 255;
const OPACITY = 1;

class ColorServiceStub extends ColorService {
    colorRed: number = RED;
    colorGreen: number = GREEN;
    colorBlue: number = BLUE;
    opacity: number = OPACITY;
}

describe('ColorOpacityComponent', () => {
    let component: ColorOpacityComponent;
    let fixture: ComponentFixture<ColorOpacityComponent>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    // tslint:disable-next-line: prefer-const
    let drawingService: DrawingService;

    let colorServiceStub: ColorServiceStub;
    let baseCtxStub: CanvasRenderingContext2D;
    // tslint:disable: no-any
    let drawComponentSpy: jasmine.Spy<any>;
    let emitComponentSpy: jasmine.Spy<any>;
    let beginPathComponentSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        colorServiceStub = new ColorServiceStub(drawingService);
        TestBed.configureTestingModule({
            declarations: [ColorOpacityComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorOpacityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        component.baseCtx = baseCtxStub;
        drawComponentSpy = spyOn<any>(component, 'draw');
        emitComponentSpy = spyOn<any>(component.color, 'emit');
        beginPathComponentSpy = spyOn<any>(component.baseCtx, 'beginPath');
    });

    mouseEvent = {
        offsetX: 20,
        offsetY: 50,
        button: 0,
    } as MouseEvent;

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should set width property', () => {
        const expectValueWidth = 40;
        const widthNumber = component.baseCanvas.nativeElement.width;

        component.ngAfterViewInit();
        expect(widthNumber).toBe(expectValueWidth);
    });

    it('draw function should call the context beginPath', () => {
        drawComponentSpy.and.callThrough();
        component.draw();
        expect(beginPathComponentSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should call draw function if initialised property to true', () => {
        component.initalized = true;

        component.ngOnChanges();
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should not call draw function if initialised property to false', () => {
        component.initalized = false;

        component.ngOnChanges();
        expect(drawComponentSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should set mousedown property to true on click', () => {
        component.onMouseDown(mouseEvent);
        expect(component.mousedown).toEqual(true);
    });

    it('onMouseDown should set selectedHeight property with  offsetY', () => {
        const mouseOffsetYClick = 50;

        component.onMouseDown(mouseEvent);
        expect(component.selectedHeight).toEqual(mouseOffsetYClick);
    });

    it('onMouseDown should call draw function', () => {
        component.onMouseDown(mouseEvent);
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('onMouseMove should set selectedHeight property with offsetY if mouse was already down', () => {
        const mouseOffsetYClick = 50;
        component.mousedown = true;

        component.onMouseMove(mouseEvent);
        expect(component.selectedHeight).toEqual(mouseOffsetYClick);
    });

    it('onMouseMove should not set selectedHeight property if mouse was already down', () => {
        component.mousedown = false;
        const oldValue = component.selectedHeight;

        component.onMouseMove(mouseEvent);
        expect(component.selectedHeight).toEqual(oldValue);
    });

    it('onMouseMove should call draw if mouse was already down', () => {
        component.mousedown = true;

        component.onMouseMove(mouseEvent);
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('onMouseMove should not call draw if mouse was not already down', () => {
        component.mousedown = false;

        component.onMouseMove(mouseEvent);
        expect(drawComponentSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set mousedown property to false', () => {
        component.onMouseUp(mouseEvent);
        expect(component.mousedown).toEqual(false);
    });

    it('emitColor should call emit with an EventEmitter objet', () => {
        const position: Vec2 = { x: 20, y: 50 };
        component.emitColor(position.x, position.y);
        expect(emitComponentSpy).toHaveBeenCalled();
    });

    it('actualColor should get redPalette property from the colorService', () => {
        const expectRedValue = 255;
        component.actualColor();
        expect(colorServiceStub.colorRed).toBe(expectRedValue);
    });

    it('couleurZeroOpacity should get bluePalette property from the colorService', () => {
        const expectBlueValue = 255;
        component.couleurZeroOpacity();
        expect(colorServiceStub.colorBlue).toBe(expectBlueValue);
    });

    it('getOpacityAtPosition should get opacity property from the colorService', () => {
        const expectOpacityValue = 1;
        component.getOpacityAtPosition();
        expect(colorServiceStub.opacity).toBe(expectOpacityValue);
    });
});
