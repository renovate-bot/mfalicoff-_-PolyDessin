import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { GridService } from '@app/services/grid/grid.service';
import { GridComponent } from './grid.component';

// tslint:disable: no-magic-numbers
describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async(() => {
        gridServiceSpy = jasmine.createSpyObj('SprayService', ['applyGrid', 'handleKey', 'changeSquareDimension']);
        TestBed.configureTestingModule({
            declarations: [GridComponent],
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('1 Using the opacity slider should call the function changeGridOpacity', () => {
        const event = new MatSliderChange();
        event.value = 10;
        const realValue = 10 / 100;

        component.changeGridOpacity(event);
        expect(gridServiceSpy.gridOpacity).toBe(realValue);
        expect(gridServiceSpy.applyGrid).toHaveBeenCalled();
    });

    it('2 bad value from opacity slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;

        component.changeGridOpacity(event);
        expect(gridServiceSpy.applyGrid).not.toHaveBeenCalled();
    });

    it('3 keyEvent should call reset', () => {
        const event = new KeyboardEvent('G');
        component.keyEvent(event);
        expect(gridServiceSpy.handleKey).toHaveBeenCalled();
        expect(gridServiceSpy.changeSquareDimension).toHaveBeenCalled();
    });

    it('5 Using the square dimension slider should call the function applyGrid', () => {
        const event = new MatSliderChange();
        event.value = 20;

        component.changeDimensionSlider(event);
        expect(gridServiceSpy.squareDimension).toBe(event.value);
        expect(gridServiceSpy.applyGrid).toHaveBeenCalled();
    });

    it('6 bad value from square dimension slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;

        component.changeDimensionSlider(event);
        expect(gridServiceSpy.applyGrid).not.toHaveBeenCalled();
    });
});
