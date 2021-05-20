import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorOpacityComponent } from '@app/components/color/color-opacity/color-opacity.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorSliderComponent } from '@app/components/color/color-slider/color-slider.component';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorComponent } from './color.component';
// tslint:disable: no-any
// tslint:disable: no-magic-numbers

describe('ColorComponent', () => {
    let component: ColorComponent;
    let colorService: ColorService;
    let fixture: ComponentFixture<ColorComponent>;
    let mouseEvent: MouseEvent;

    let selectPrimColorComponentSpy: jasmine.Spy<any>;
    let selectSecondColorComponentSpy: jasmine.Spy<any>;
    let updateColorComponentSpy: jasmine.Spy<any>;
    let switchColorsComponentSpy: jasmine.Spy<any>;
    let returnColorStringComponentSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        colorService = new ColorService(new DrawingService());
        TestBed.configureTestingModule({
            declarations: [ColorComponent, ColorSliderComponent, ColorPaletteComponent, ColorOpacityComponent],
            providers: [{ provide: ColorService, useValue: colorService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        updateColorComponentSpy = spyOn<any>(component.colorService, 'updateColor');
        returnColorStringComponentSpy = spyOn<any>(component, 'returnColorString').and.callThrough();
        mouseEvent = {
            offsetX: 20,
            offsetY: 50,
            button: 0,
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('addRecentColor should update all button colors', () => {
        component.recentColors[Constants.COLOR_0] = fixture.debugElement.nativeElement.querySelector('#color1');
        component.recentColors[Constants.COLOR_1] = fixture.debugElement.nativeElement.querySelector('#color2');
        component.recentColors[Constants.COLOR_2] = fixture.debugElement.nativeElement.querySelector('#color3');
        component.recentColors[Constants.COLOR_3] = fixture.debugElement.nativeElement.querySelector('#color4');
        component.recentColors[Constants.COLOR_4] = fixture.debugElement.nativeElement.querySelector('#color5');
        component.recentColors[Constants.COLOR_5] = fixture.debugElement.nativeElement.querySelector('#color6');
        component.recentColors[Constants.COLOR_6] = fixture.debugElement.nativeElement.querySelector('#color7');
        component.recentColors[Constants.COLOR_7] = fixture.debugElement.nativeElement.querySelector('#color8');
        component.recentColors[Constants.COLOR_8] = fixture.debugElement.nativeElement.querySelector('#color9');
        component.recentColors[Constants.COLOR_9] = fixture.debugElement.nativeElement.querySelector('#color10');
        component.addRecentColor();
        expect(returnColorStringComponentSpy).toHaveBeenCalled();
        expect(component.recentColors[Constants.COLOR_0].style.backgroundColor).toEqual('rgb(0, 0, 0)');
    });
    it('selectPrimColor should change primary color', () => {
        fixture.debugElement.nativeElement.querySelector('#color1').style.backgroundColor = 'black';
        mouseEvent = {
            target: fixture.debugElement.nativeElement.querySelector('#color1'),
        } as MouseEvent;
        component.selectPrimColor(mouseEvent);
        expect(component.primaryColor.style.backgroundColor).toEqual('black');
    });
    it('selectSecondColor should change secondary color', () => {
        fixture.debugElement.nativeElement.querySelector('#color1').style.backgroundColor = 'black';
        mouseEvent = {
            target: fixture.debugElement.nativeElement.querySelector('#color1'),
        } as MouseEvent;
        component.selectSecondColor(mouseEvent);
        expect(component.secondColor.style.backgroundColor).toEqual('black');
    });
    // tslint:disable:no-empty
    it('preventCtxMenu should call preventDefault', () => {
        mouseEvent = {
            preventDefault: () => {},
        } as MouseEvent;
        const preventDefaultSpy = spyOn(mouseEvent, 'preventDefault');
        component.preventCtxMenu(mouseEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('switchPrimAndSecond change the color of the primary and secondary color if property are not null and switchColors is call', () => {
        switchColorsComponentSpy = spyOn<any>(component.colorService, 'switchColors');

        component.switchPrimAndSecond();
        expect(component.primaryColor?.style.background).toBe(component.secondColor?.style.background);
        expect(component.secondColor?.style.background).toBe(component.primaryColor?.style.background);
        expect(switchColorsComponentSpy).toHaveBeenCalled();
    });

    it('switchPrimAndSecond call updateColor if primaryColor is null and colorIsPrim is false', () => {
        component.colorService.colorIsPrim = false;

        component.switchPrimAndSecond();
        expect(updateColorComponentSpy).toHaveBeenCalled();
    });

    it('getActualColor call setPrimColor if modifyingPrimaryColor is true and set primaryColor background color if primaryColor is not null', () => {
        component.modifyingPrimaryColor = true;

        component.getActualColor();
        expect(updateColorComponentSpy).toHaveBeenCalled();
    });

    it('getActualColor call setSecColor if modifyingPrimaryColor is false and set secondColor background color if primaryColor is not null', () => {
        component.modifyingPrimaryColor = false;

        component.getActualColor();
        expect(returnColorStringComponentSpy).toHaveBeenCalled();
    });

    it('setColorSelectorVisibility change setColorSelectorVisibility property to true ', () => {
        component.setColorSelectorVisibility();
        expect(component.colorSelectorIsVisible).toBe(true);
        component.setColorSelectorVisibility();
        expect(component.colorSelectorIsVisible).toBe(false);
    });

    it('setColorToModify change modifyingPrimaryColor property to the boolean parameter', () => {
        const bool = true;
        component.setColorToModify(bool);
        expect(component.modifyingPrimaryColor).toBe(bool);
    });

    it('selectPrimOrSecondColor should call selectPrimColor function if left click', () => {
        selectPrimColorComponentSpy = spyOn<any>(component, 'selectPrimColor');
        component.selectPrimOrSecondColor(mouseEvent);
        expect(selectPrimColorComponentSpy).toHaveBeenCalled();
    });
    it('onClickHexBtn should change the button color and update the color if hex is valid', () => {
        component.redHex = new ElementRef(document.createElement('input'));
        component.greenHex = new ElementRef(document.createElement('input'));
        component.blueHex = new ElementRef(document.createElement('input'));
        component.redHex.nativeElement.value = 'ff';
        component.greenHex.nativeElement.value = 'ff';
        component.blueHex.nativeElement.value = 'ff';
        component.modifyingPrimaryColor = true;
        component.applyHexColor();
        expect(component.primaryColor.style.backgroundColor).toEqual('rgb(255, 255, 255)');
        component.modifyingPrimaryColor = false;
        component.applyHexColor();
        expect(component.secondColor.style.backgroundColor).toEqual('rgb(255, 255, 255)');
    });
    it('onClickHexBtn should set invalidColorMessage to true if the hex value is not valid', () => {
        component.redHex = new ElementRef(document.createElement('input'));
        component.greenHex = new ElementRef(document.createElement('input'));
        component.blueHex = new ElementRef(document.createElement('input'));
        component.redHex.nativeElement.value = 'fg';
        component.greenHex.nativeElement.value = '-1';
        component.blueHex.nativeElement.value = '0';
        component.applyHexColor();
        expect(component.invalidColorMessage).toBeTrue();
        setTimeout(() => {
            expect(component.invalidColorMessage).toBeFalse();
        }, Constants.TIMER_DELAY_2000 + 5000);
    });

    it('selectPrimOrSecondColor should call selectSecondColor function if right click', () => {
        selectSecondColorComponentSpy = spyOn<any>(component, 'selectSecondColor');
        mouseEvent = {
            offsetX: 20,
            offsetY: 50,
            button: 2,
        } as MouseEvent;
        component.selectPrimOrSecondColor(mouseEvent);
        expect(selectSecondColorComponentSpy).toHaveBeenCalled();
    });

    it('selectPrimColor set primaryColor with a color from the recent color', () => {
        component.selectPrimColor(mouseEvent);
        expect(component.primaryColor?.style.backgroundColor).toBeDefined();
    });

    it('selectSecondColor set secondColor with a color from the recent color', () => {
        component.selectSecondColor(mouseEvent);
        expect(component.secondColor?.style.backgroundColor).toBeDefined();
    });

    it('updateContext call updateColor and set colorIsPrim', () => {
        const color = 'rgb(0, 0, 0)';
        const bool = false;
        component.updateContext(color, bool);
        expect(updateColorComponentSpy).toHaveBeenCalled();
        expect(component.colorService.colorIsPrim).toEqual(bool);
    });

    it('updateBorders set primaryColor.style.border if primaryColor is not null', () => {
        const border = '5px double rgb(0, 0, 0)';
        component.colorService.colorIsPrim = true;
        component.updateBorders();
        expect(component.primaryColor?.style.border).toBe(border);
    });

    it('updateBorders set primaryColor.style.border if primaryColor is not null', () => {
        const noBorder = '5px none rgb(0, 0, 0)';
        component.colorService.colorIsPrim = false;
        component.updateBorders();
        expect(component.primaryColor?.style.border).toBe(noBorder);
    });

    it('returnColorString should get redPalette from colorService', () => {
        component.colorService.redPalette = 255;
        component.colorService.bluePalette = 255;
        component.colorService.greenPalette = 255;
        component.colorService.opacity = 1;

        returnColorStringComponentSpy.and.callThrough();
        component.returnColorString();
        expect(component.returnColorString()).toEqual('rgb(255,255,255,1)');
    });
    it('onClickHexBtn should not call updateColor when modified color is different than selected color', () => {
        component.redHex = new ElementRef(document.createElement('input'));
        component.greenHex = new ElementRef(document.createElement('input'));
        component.blueHex = new ElementRef(document.createElement('input'));
        component.redHex.nativeElement.value = 'ff';
        component.greenHex.nativeElement.value = 'ff';
        component.blueHex.nativeElement.value = 'ff';
        component.modifyingPrimaryColor = true;
        colorService.colorIsPrim = false;
        component.applyHexColor();
        expect(updateColorComponentSpy).not.toHaveBeenCalled();

        component.modifyingPrimaryColor = false;
        colorService.colorIsPrim = true;
        component.applyHexColor();
        expect(updateColorComponentSpy).not.toHaveBeenCalled();

        component.modifyingPrimaryColor = false;
        colorService.colorIsPrim = false;
        component.applyHexColor();
        expect(updateColorComponentSpy).toHaveBeenCalled();
    });
});
