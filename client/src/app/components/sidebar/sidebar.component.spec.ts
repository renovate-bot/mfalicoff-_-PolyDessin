import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorOpacityComponent } from '@app/components/color/color-opacity/color-opacity.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorSliderComponent } from '@app/components/color/color-slider/color-slider.component';
import { ColorComponent } from '@app/components/color/color.component';
import { GridComponent } from '@app/components/drawing/grid/grid.component';
import { BucketToolbarComponent } from '@app/components/sidebar/bucket-toolbar/bucket-toolbar.component';
import { ClipboardComponent } from '@app/components/sidebar/clipboard/clipboard.component';
import { ContentSelectorComponent } from '@app/components/sidebar/content-selector/content-selector.component';
import { EllipseToolbarComponent } from '@app/components/sidebar/ellipse-toolbar/ellipse-toolbar.component';
import { EraserComponent } from '@app/components/sidebar/eraser-toolbar/eraser.component';
import { LineComponent } from '@app/components/sidebar/line-component/line.component';
import { PencilComponent } from '@app/components/sidebar/pencil-toolbar/pencil.component';
import { PolygonComponent } from '@app/components/sidebar/polygon-toolbar/polygon/polygon.component';
import { RectangleComponent } from '@app/components/sidebar/rectangle-toolbar/rectangle.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SprayComponent } from '@app/components/sidebar/spray/spray-toolbar/spray.component';
import { StampComponent } from '@app/components/sidebar/toolbar-stamp/stamp/stamp.component';
import { UndoRedoComponent } from '@app/components/sidebar/undo-redo/undo-redo/undo-redo.component';
import { WindowButtonsComponent } from '@app/components/sidebar/window-buttons/window-buttons.component';
import { SaveMenuComponent } from '@app/components/windows/create/save-menu.component';
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

// tslint:disable:no-any
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let editorService: EditorSelectorService;
    let undoRedoService: UndoRedoService;
    let selectToolSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;

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
            declarations: [
                SidebarComponent,
                RectangleComponent,
                PolygonComponent,
                PencilComponent,
                EraserComponent,
                LineComponent,
                SaveMenuComponent,
                EllipseToolbarComponent,
                ColorComponent,
                ColorOpacityComponent,
                ColorPaletteComponent,
                ColorPaletteComponent,
                ColorSliderComponent,
                ContentSelectorComponent,
                UndoRedoComponent,
                SprayComponent,
                GridComponent,
                StampComponent,
                ClipboardComponent,
                BucketToolbarComponent,
                WindowButtonsComponent,
            ],
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: EditorSelectorService, useValue: editorService },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        component['drawingService'].baseCtx = baseCtxStub;
        component['drawingService'].canvas = canvasTestHelper.canvas; // Jasmine doesnt copy properties with underlying data

        selectToolSpy = spyOn(component, 'selectTool');
    });

    it('1 should create', () => {
        expect(component).toBeTruthy();
    });

    it('2. should call change tool with pencil', async () => {
        const button = fixture.debugElement.query(By.css('#pencil'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('pencil');
    });

    it('3. should call change tool with eraser', async () => {
        const button = fixture.debugElement.query(By.css('#eraser'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('eraser');
    });

    it('4. should call change tool with line', async () => {
        const button = fixture.debugElement.query(By.css('#line-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('line');
    });

    it('5. should call change tool with selector', async () => {
        const button = fixture.debugElement.query(By.css('#selector-btn'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('selector');
    });

    it('6. should call change tool with rectangle', async () => {
        const button = fixture.debugElement.query(By.css('#rectangle-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('rectangle');
    });

    it('7. should call change tool with ellipse', async () => {
        const button = fixture.debugElement.query(By.css('#ellipse-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('ellipse');
    });

    it('8. should call change tool with polygon', async () => {
        const button = fixture.debugElement.query(By.css('#polygon-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('polygon');
    });

    it('9. should call change tool with spray', async () => {
        const button = fixture.debugElement.query(By.css('#spray-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('spray');
    });

    it('10. should call change tool with stamp', async () => {
        const button = fixture.debugElement.query(By.css('#stamp-selector'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('stamp');
    });

    it('11. should call change tool with bucket', async () => {
        const button = fixture.debugElement.query(By.css('#bucket'));
        button.triggerEventHandler('click', null);
        expect(selectToolSpy).toHaveBeenCalledWith('bucket');
    });

    it('12. select tool should change tool in editorService', () => {
        const changeToolSpy = spyOn(component['editorSelectorService'], 'changeTool');
        spyOn(component['editorSelectorService'].currentTool, 'initTool');
        selectToolSpy.and.callThrough();
        component.selectTool('eraser');
        expect(changeToolSpy).toHaveBeenCalledWith('eraser');
    });

    it('13. if tool to change is selector, select rectangle selector', () => {
        const changeToolSpy = spyOn(component['editorSelectorService'], 'changeTool');
        spyOn(component['editorSelectorService'].currentTool, 'initTool');
        selectToolSpy.and.callThrough();
        component.selectTool('selector');
        expect(changeToolSpy).toHaveBeenCalledWith('selector');
        expect(component['contentSelectorService'].selectorTool.name).toEqual('rectangle');
    });

    it('14. should return current tool name', () => {
        expect(component.isToolSelected('pencil')).toEqual(true);
    });

    it('15. changeSelection change the boolean gridIsSelected value', () => {
        component.isGridSelected = true;

        component.switchGrid();
        expect(component.isGridSelected).toEqual(false);
    });
});
