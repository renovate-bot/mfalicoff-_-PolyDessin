import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { BucketService } from '@app/services/tools/editor-tools/bucket-paint/bucket.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { FreeHandSelectorService } from '@app/services/tools/editor-tools/content-selector/freehand-selector/freehand-selector.service';
import { RectangleSelectorService } from '@app/services/tools/editor-tools/content-selector/rectangle-selector/rectangle-selector.service';
import { EllipseService } from '@app/services/tools/editor-tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/editor-tools/eraser/eraser-service.service';
import { LineService } from '@app/services/tools/editor-tools/line/line.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { PolygonService } from '@app/services/tools/editor-tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/editor-tools/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/editor-tools/spray/spray.service';
import { StampService } from '@app/services/tools/editor-tools/stamp/stamp.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { WindowButtonsComponent } from './window-buttons.component';

// tslint:disable:no-string-literal
describe('WindowButtonsComponent', () => {
    let component: WindowButtonsComponent;
    let fixture: ComponentFixture<WindowButtonsComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let editorService: EditorSelectorService;
    let undoRedoService: UndoRedoService;

    const matDialogSpy = {
        open: () => {
            return {};
        },
    };

    beforeEach(async(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearContext', 'canvasIsBlank']);
        undoRedoService = new UndoRedoService(drawServiceSpy);
        editorService = new EditorSelectorService(
            new PencilService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new RectangleService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new EllipseService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new EraserService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new LineService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new ColorService(drawServiceSpy),
            new ContentSelectorService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            drawServiceSpy,
            undoRedoService,
            new PolygonService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new SprayService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new StampService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new BucketService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
            new RectangleSelectorService(drawServiceSpy),
            new FreeHandSelectorService(drawServiceSpy),
            new ClipboardService(
                new ContentSelectorService(drawServiceSpy, new ColorService(drawServiceSpy), undoRedoService),
                drawServiceSpy,
                undoRedoService,
            ),
        );
        TestBed.configureTestingModule({
            declarations: [WindowButtonsComponent],
            imports: [MaterialModule],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: EditorSelectorService, useValue: editorService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WindowButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        component['drawingService'].baseCtx = baseCtxStub;
        component['drawingService'].canvas = canvasTestHelper.canvas; // Jasmine doesnt copy properties with underlying data
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('1. pressing save button should call open save menu', () => {
        const saveSpy = spyOn(component, 'openSaveMenu');
        const button = fixture.debugElement.query(By.css('#save'));
        button.triggerEventHandler('click', null);
        expect(saveSpy).toHaveBeenCalled();
    });

    it('2. pressing export button should call open export menu', () => {
        const exportSpy = spyOn(component, 'openExportMenu');
        const button = fixture.debugElement.query(By.css('#export'));
        button.triggerEventHandler('click', null);
        expect(exportSpy).toHaveBeenCalled();
    });

    it('3. pressing save button should call open save menu', () => {
        const gallerySpy = spyOn(component, 'openGalleryMenu');
        const button = fixture.debugElement.query(By.css('#gallery'));
        button.triggerEventHandler('click', null);
        expect(gallerySpy).toHaveBeenCalled();
    });

    it('4. save menu should open dialog', () => {
        const dialogSpy = spyOn(component['dialog'], 'open');
        component.openSaveMenu();
        expect(dialogSpy).toHaveBeenCalled();
        expect(component['editorService'].isSaving).toEqual(true);
    });

    it('5. export menu should open menu', () => {
        component.openExportMenu();
        expect(component['editorService'].isExporting).toEqual(true);
    });

    it('4. gallery menu should open dialog', () => {
        const dialogSpy = spyOn(component['dialog'], 'open');
        component.openGalleryMenu();
        expect(dialogSpy).toHaveBeenCalled();
        expect(component['editorService'].isLoading).toEqual(true);
    });
    it(' 5 new drawing window button should call createNewDrawing', () => {
        // tslint:disable-next-line: only-arrow-functions
        drawServiceSpy.canvasIsBlank.and.callFake(function (): boolean {
            return true;
        });
        const button = fixture.debugElement.nativeElement.querySelector('#newDrawing');
        const newDrawingSpy = spyOn(component, 'createNewDrawing').and.callThrough();
        button?.click();
        expect(newDrawingSpy).toHaveBeenCalled();
    });
    it('6 button should set the save window visibility to true only if a drawing is in progress', () => {
        // tslint:disable-next-line: only-arrow-functions
        drawServiceSpy.canvasIsBlank.and.callFake(function (): boolean {
            return true;
        });
        const button = document.getElementById('newDrawing');
        button?.click();
        expect(editorService.isCreatingNewDrawing).toBeFalse();

        // tslint:disable-next-line: only-arrow-functions
        drawServiceSpy.canvasIsBlank.and.callFake(function (): boolean {
            return false;
        });
        button?.click();
        expect(editorService.isCreatingNewDrawing).toBeTrue();
    });
});
