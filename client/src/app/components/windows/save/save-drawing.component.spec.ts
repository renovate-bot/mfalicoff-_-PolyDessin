import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HttpResponse } from '@app/classes/http-response';
import { CommunicationSubscriptionService } from '@app/services/communication/communication-subscriptions/communication-subscription.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { of } from 'rxjs';
import { SaveDrawingComponent } from './save-drawing.component';
import SpyObj = jasmine.SpyObj;

interface Tag {
    name: string;
}

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
describe('SaveDrawingComponent', () => {
    let component: SaveDrawingComponent;
    let fixture: ComponentFixture<SaveDrawingComponent>;
    let imageServiceSpy: SpyObj<CommunicationService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let editorServiceSpy: SpyObj<EditorSelectorService>;
    let subscriptionServiceSpy: SpyObj<CommunicationSubscriptionService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;

    const mockSnackbar = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(async(() => {
        subscriptionServiceSpy = jasmine.createSpyObj('CommunicationSubscriptionService', ['imageSaveEventListener', 'postImage']);
        imageServiceSpy = jasmine.createSpyObj('ImageMessageService', ['postImage']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearContext']);
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['getCurrentToolName']);
        imageServiceSpy.postImage.and.returnValue(of());

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MaterialModule, BrowserAnimationsModule],
            declarations: [SaveDrawingComponent],
            providers: [
                { provide: CommunicationService, useValue: imageServiceSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: MatSnackBar, useValue: mockSnackbar },
                { provide: CommunicationSubscriptionService, useValue: subscriptionServiceSpy },
            ],
        }).compileComponents();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        drawServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        subscriptionServiceSpy = TestBed.inject(CommunicationSubscriptionService) as jasmine.SpyObj<CommunicationSubscriptionService>;
        subscriptionServiceSpy.imageSaveEventListener.and.returnValue(of(new HttpResponse(true, '')));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveDrawingComponent);
        component = fixture.componentInstance;
        component['drawingService'].baseCtx = baseCtxStub;
        component['drawingService'].canvas = canvasStub;
        canvasStub.width = 800;
        canvasStub.height = 1000;

        editorServiceSpy.isSaving = true;

        fixture.detectChanges();
    });

    it('1. should create', () => {
        expect(component).toBeTruthy();
    });

    it('2. should add tag to tag array', async () => {
        const inputElem = document.getElementById('tagInput') as HTMLInputElement;
        spyOn(component, 'validateTags').and.returnValue(true);

        inputElem.value = 'test';
        const event: MatChipInputEvent = {
            value: 'tagtest',
            input: inputElem,
        };
        component.form = new FormGroup({
            name: new FormControl(''),
            tags: new FormControl([]),
        });
        component['tags'].setValue([]);
        component.add(event);
        expect(component['tags'].value.length).toEqual(1);
    });

    it('3. should not tag if null', async () => {
        const inputElem = document.getElementById('tagInput') as HTMLInputElement;
        spyOn(component, 'validateTags').and.returnValue(false);
        inputElem.value = 'test';
        const event: MatChipInputEvent = {
            value: '',
            input: inputElem,
        };
        component.form = new FormGroup({
            name: new FormControl(''),
            tags: new FormControl([]),
        });
        component['tags'].setValue([]);
        component.add(event);
        expect(component['tags'].value.length).toEqual(0);
    });

    it('4. should remove tag to tag array', () => {
        component.form = new FormGroup({
            name: new FormControl(''),
            tags: new FormControl([]),
        });
        const tagToRemove: Tag = {
            name: 'tag1',
        };
        component.tags.setValue([tagToRemove]);

        component.remove(tagToRemove);
        expect(component['tags'].value.indexOf(tagToRemove)).toEqual(-1);
    });

    it('4. should reset on cancel Save', () => {
        component.cancelSave();
        expect(component.name.value).toEqual('');
        expect(component.form.value).toEqual({ name: '', tags: [] });
    });

    it('5. should call postImage when calling save', () => {
        component.save();
        expect(subscriptionServiceSpy.postImage).toHaveBeenCalled();
    });

    it('6. should not remove if not in', () => {
        component.form = new FormGroup({
            name: new FormControl(''),
            tags: new FormControl([]),
        });
        const tagToRemove: Tag = {
            name: 'tag1',
        };
        component.tags.setValue([tagToRemove]);
        const tagToRemove1: Tag = {
            name: 'tag2',
        };
        component.remove(tagToRemove1);
        expect(component['tags'].value.indexOf(tagToRemove)).toEqual(0);
    });

    it('7 should subscribe on message on ngOnInit', async () => {
        component.ngOnInit();
        fixture.detectChanges();
        expect(subscriptionServiceSpy.imageSaveEventListener).toHaveBeenCalled();
    });

    it('8 should subscribe on message on ngOnInit with error', async () => {
        subscriptionServiceSpy.imageSaveEventListener.and.returnValue(of(new HttpResponse(false, '')));

        component.ngOnInit();
        fixture.detectChanges();
        expect(subscriptionServiceSpy.imageSaveEventListener).toHaveBeenCalled();
    });

    it('9 should validate title', () => {
        component.form = new FormGroup({
            name: new FormControl('test'),
            tags: new FormControl([]),
        });
        const titlePass = 'test';
        const titleFail = '';
        expect(component.validateTitle(titlePass)).toBe(true);
        expect(component.validateTitle(titleFail)).toBe(false);
    });

    it('10 should validate tags', () => {
        const titlePass = 'test';
        const titleFail = '@';
        expect(component.validateTags(titlePass)).toBe(true);
        expect(component.validateTags(titleFail)).toBe(false);
    });

    it('11. should add tag to tag array but not reset input value if not present', async () => {
        const inputElem = document.getElementById('tagInput') as HTMLInputElement;
        spyOn(component, 'validateTags').and.returnValue(true);

        inputElem.value = '';
        const event: MatChipInputEvent = {
            value: 'tagtest',
            input: inputElem,
        };
        component.form = new FormGroup({
            name: new FormControl(''),
            tags: new FormControl([]),
        });
        component['tags'].setValue([]);
        component.add(event);
        expect(component['tags'].value.length).toEqual(1);
    });
});
