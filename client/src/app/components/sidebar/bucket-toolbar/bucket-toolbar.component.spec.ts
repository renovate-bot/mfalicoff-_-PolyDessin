import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { MaterialModule } from '@app/angular-material';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { BucketService } from '@app/services/tools/editor-tools/bucket-paint/bucket.service';
import { BucketToolbarComponent } from './bucket-toolbar.component';
import SpyObj = jasmine.SpyObj;

describe('BucketToolbarComponent', () => {
    let component: BucketToolbarComponent;
    let fixture: ComponentFixture<BucketToolbarComponent>;
    let editorServiceSpy: SpyObj<EditorSelectorService>;
    let bucketServiceSpy: SpyObj<BucketService>;

    beforeEach(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName']);
        bucketServiceSpy = jasmine.createSpyObj('BuckectService', ['changeColorTolerance']);
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BucketToolbarComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: BucketService, useValue: bucketServiceSpy },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BucketToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the slider should call the function changeFontSize from PencilService', () => {
        const event = new MatSliderChange();
        event.value = 2;
        component.changeColorTolerance(event);
        expect(bucketServiceSpy.changeColorTolerance).toHaveBeenCalled();
    });

    it('Using the slider should not call the function changeFontSize if value = null', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeColorTolerance(event);
        expect(bucketServiceSpy.changeColorTolerance).not.toHaveBeenCalled();
    });

    it('should return from isBucket', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('bucket');
        expect(component.isBucketSelected()).toEqual(true);
    });
});
