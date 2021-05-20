import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { StampService } from '@app/services/tools/editor-tools/stamp/stamp.service';
import { StampComponent } from './stamp.component';

// tslint:disable:no-magic-numbers
describe('StampComponent', () => {
    let component: StampComponent;
    let fixture: ComponentFixture<StampComponent>;
    let stampServiceSpy: jasmine.SpyObj<StampService>;
    let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;

    beforeEach(async(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName']);
        stampServiceSpy = jasmine.createSpyObj('StampService', ['rotateImg']);

        TestBed.configureTestingModule({
            declarations: [StampComponent],
            providers: [
                { provide: StampService, useValue: stampServiceSpy },
                { provide: EditorSelectorService, useValue: editorServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('1 Using the size slider should change stampSize value', () => {
        const event = new MatSliderChange();
        event.value = 10;
        const realValue = 10 * 20;

        component.changeStampSize(event);
        expect(stampServiceSpy.stampSize).toBe(realValue);
    });

    it('2 bad value from size slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        stampServiceSpy.stampSize = -5;

        component.changeStampSize(event);
        expect(stampServiceSpy.stampSize).toBeDefined(event.value);
    });

    it('3 wheelEvent should call rotateImg', () => {
        const event = new WheelEvent('wheel');
        component.wheelEvent(event);
        expect(stampServiceSpy.rotateImg).toHaveBeenCalled();
    });

    it('4 Using the angle slider should change sliderAngleValue value', () => {
        const event = new MatSliderChange();
        event.value = 10;

        component.changeRotationAngle(event);
        expect(stampServiceSpy.sliderAngleValue).toEqual(event.value);
    });

    it('5 bad value from angle slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        stampServiceSpy.sliderAngleValue = -5;

        component.changeRotationAngle(event);
        expect(stampServiceSpy.sliderAngleValue).toBeDefined(event.value);
    });

    it('6 should return from getIsStamp', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('stamp');
        expect(component.getIsStamp()).toEqual(true);
    });

    it('7 should return true if stamp1 is selected', () => {
        stampServiceSpy.imgName = 'stamp1';
        expect(component.selectedStamp('stamp1')).toEqual(true);
    });
});
