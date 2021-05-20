import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/angular-material';
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
import { SaveMenuComponent } from './save-menu.component';
describe('SaveMenuComponent', () => {
    let component: SaveMenuComponent;
    let fixture: ComponentFixture<SaveMenuComponent>;
    let editorService: EditorSelectorService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoService: UndoRedoService;

    const matDialogSpy = {
        open: () => {
            return {};
        },
        closeAll: () => {
            return;
        },
    };
    beforeEach(async(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearContext', 'canvasIsBlank', 'clearCanvas']);
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
            declarations: [SaveMenuComponent],
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: EditorSelectorService, useValue: editorService },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
            imports: [MaterialModule, BrowserAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveMenuComponent);
        component = fixture.componentInstance;
        component.editorService.isCreatingNewDrawing = true;
        fixture.detectChanges();
    });
    it('1 should create', () => {
        expect(component).toBeTruthy();
    });

    it('2 save button should show save window, close new drawing window and call clearContext', () => {
        const button = fixture.debugElement.query(By.css('#saveBtn'));
        const openSpy = spyOn(component.dialog, 'open');
        button.triggerEventHandler('click', null);
        expect(openSpy).toHaveBeenCalled();
        expect(editorService.isCreatingNewDrawing).toBeFalse();
    });

    it('3 discard button should call clearContext and close new drawing window', () => {
        component.discardDrawing();
        expect(drawServiceSpy.clearContext).toHaveBeenCalled();
        expect(editorService.isCreatingNewDrawing).toBeFalse();
    });

    it('4 cancel button should close new drawing window', () => {
        const button = fixture.debugElement.query(By.css('#cancelBtn'));
        const cancelSpy = spyOn(component, 'hideWindow').and.callThrough();

        button.triggerEventHandler('click', null);
        expect(cancelSpy).toHaveBeenCalled();
        expect(editorService.isCreatingNewDrawing).toBeFalse();
    });
});
