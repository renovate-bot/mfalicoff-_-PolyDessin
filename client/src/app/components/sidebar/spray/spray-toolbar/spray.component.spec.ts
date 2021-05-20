import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { MaterialModule } from '@app/angular-material';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { SprayService } from '@app/services/tools/editor-tools/spray/spray.service';
import { SprayComponent } from './spray.component';

// tslint:disable: no-magic-numbers
// tslint:disable: no-any
describe('SprayComponent', () => {
    let component: SprayComponent;
    let fixture: ComponentFixture<SprayComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;
    let sprayServiceSpy: jasmine.SpyObj<SprayService>;

    beforeEach(async(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName', 'changeFontSize']);
        sprayServiceSpy = jasmine.createSpyObj('SprayService', ['']);

        TestBed.configureTestingModule({
            declarations: [SprayComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: SprayService, useValue: sprayServiceSpy },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        editorServiceSpy.tools = [];
        sprayServiceSpy.dropletSize = 1;
        sprayServiceSpy.emissionSpeed = 10;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('4 Using the font slider should call the function changeFontSize from editor', () => {
        const event = new MatSliderChange();
        event.value = 10;

        component.changeFontSize(event);
        expect(sprayServiceSpy.spraySize).toBe(event.value);
    });

    it('5 bad value from font slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        sprayServiceSpy.spraySize = -5;
        component.changeFontSize(event);
        expect(sprayServiceSpy.spraySize).toBeDefined(event.value);
    });

    it('6 Using the droplet size slider should call the function changeDropletSize from editor', () => {
        const event = new MatSliderChange();
        event.value = 1;

        component.changeDropletSize(event);
        expect(sprayServiceSpy.dropletSize).toBe(event.value);
    });

    it('7 bad value from droplet size slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        sprayServiceSpy.dropletSize = -5;

        component.changeDropletSize(event);
        expect(sprayServiceSpy.dropletSize).toBeDefined(event.value);
    });

    it('8 Using the emission speed slider should call the function changeEmissionSpeed from editor', () => {
        const event = new MatSliderChange();
        event.value = 10;

        component.changeEmissionSpeed(event);
        expect(sprayServiceSpy.emissionSpeed).toBe(event.value);
    });

    it('9 bad value from emission speed slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        sprayServiceSpy.emissionSpeed = -5;

        component.changeEmissionSpeed(event);
        expect(sprayServiceSpy.emissionSpeed).toBeDefined(event.value);
    });

    it('should return from isSpray', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('spray');
        expect(component.getIsSpray()).toEqual(true);
    });
});
