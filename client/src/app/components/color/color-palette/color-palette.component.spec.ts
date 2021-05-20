import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ColorPaletteComponent } from './color-palette.component';
// tslint:disable: no-any
// tslint:disable: no-magic-numbers

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let mouseEvent: MouseEvent;

    let beginPathComponentSpy: jasmine.Spy<any>;
    let drawComponentSpy: jasmine.Spy<any>;
    let emitComponentSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

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

    it('ngAfterViewInit should set initialised property to true', () => {
        component.ngAfterViewInit();
        expect(component.initalized).toBe(true);
    });

    it('draw function should call the context beginPath', () => {
        component.selectedPosition = { x: 10, y: 10 };
        drawComponentSpy.and.callThrough();
        component.draw();
        expect(beginPathComponentSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should call draw function if initialised property to true', () => {
        component.initalized = true;
        component.selectedPosition = { x: 20, y: 50 };

        component.ngOnChanges();
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should not call draw function if initialised property to false', () => {
        component.initalized = false;

        component.ngOnChanges();
        expect(drawComponentSpy).not.toHaveBeenCalled();
    });

    it('ngOnChanges should call emit function with EventEmitter objet if initialised property to true', () => {
        component.initalized = true;
        component.selectedPosition = { x: 20, y: 50 };

        component.ngOnChanges();
        expect(emitComponentSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should not call emit function with EventEmitter objet if initialised property to false', () => {
        component.initalized = false;
        component.selectedPosition = { x: 20, y: 50 };

        component.ngOnChanges();
        expect(emitComponentSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set mousedown property to false', () => {
        component.onMouseUp(mouseEvent);
        expect(component.mousedown).toEqual(false);
    });

    it('onMouseDown should set mousedown property to true on click', () => {
        component.onMouseDown(mouseEvent);
        expect(component.mousedown).toEqual(true);
    });

    it('onMouseDown should set selectedPosition property with X ans Y mouse position', () => {
        const expectedResult: Vec2 = { x: 20, y: 50 };

        component.onMouseDown(mouseEvent);
        expect(component.selectedPosition).toEqual(expectedResult);
    });

    it('onMouseDown should call draw function', () => {
        component.onMouseDown(mouseEvent);
        expect(drawComponentSpy).toHaveBeenCalled();
    });

    it('onMouseMove should set selectedPosition property with X ans Y mouse position if mouse was already down', () => {
        const expectedResult: Vec2 = { x: 20, y: 50 };
        component.mousedown = true;

        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).toEqual(expectedResult);
    });

    it('onMouseMove should not set selectedPosition property if mouse was already down', () => {
        component.mousedown = false;
        component.ngAfterViewInit();

        const result = { x: 0, y: 0 };
        component.onMouseMove(mouseEvent);
        expect(component.selectedPosition).toEqual(result);
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

    it('emitColor should call emit with an EventEmitter objet', () => {
        const position: Vec2 = { x: 20, y: 50 };
        component.emitColor(position.x, position.y);
        expect(emitComponentSpy).toHaveBeenCalled();
    });

    it('getColorAtPositionFromPalette should set redPalette property from colorService', () => {
        const position: Vec2 = { x: 20, y: 50 };
        const imageDate = component.baseCtx.getImageData(position.x, position.y, 1, 1).data;
        const rouge = imageDate[0];

        component.getColorAtPositionFromPalette(position.x, position.y);
        expect(component.colorService.redPalette).toBe(rouge);
    });
});
