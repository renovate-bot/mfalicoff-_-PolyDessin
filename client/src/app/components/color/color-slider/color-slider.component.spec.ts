import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ColorSliderComponent } from './color-slider.component';
// tslint:disable: no-any
// tslint:disable: no-magic-numbers

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;

    let drawComponentSpy: jasmine.Spy<any>;
    let emitComponentSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        component.baseCtx = baseCtxStub;

        drawComponentSpy = spyOn<any>(component, 'draw');
        emitComponentSpy = spyOn<any>(component.color, 'emit');
    });

    mouseEvent = {
        offsetX: 10,
        offsetY: 90,
        button: 0,
    } as MouseEvent;

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call draw function', () => {
        component.ngAfterViewInit();
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('onMouseDown should set mousedown property to true on click', () => {
        component.onMouseDown(mouseEvent);
        expect(component.mousedown).toEqual(true);
    });

    it('onMouseDown should set selectedHeight property with offsetY', () => {
        const mouseOffsetYClick = 90;

        component.onMouseDown(mouseEvent);
        expect(component.selectedHeight).toEqual(mouseOffsetYClick);
    });

    it('onMouseDown should call draw function', () => {
        component.onMouseDown(mouseEvent);
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('onMouseMove should set selectedHeight property with offsetY if mouse was already down', () => {
        const mouseOffsetYClick = 90;
        component.mousedown = true;

        component.onMouseMove(mouseEvent);
        expect(component.selectedHeight).toEqual(mouseOffsetYClick);
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

    it('getColorAtPositionFromSlider should set redPalette property from colorService', () => {
        const position: Vec2 = { x: 20, y: 50 };
        const imageDate = component.baseCtx.getImageData(position.x, position.y, 1, 1).data;
        const rouge = imageDate[0];

        component.getColorAtPositionFromSlider(position.x, position.y);
        expect(component.colorService.redSlider).toBe(rouge);
    });
});
