import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HttpResponse } from '@app/classes/http-response';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { ColorService } from '@app/services/color/color.service';
import { CommunicationSubscriptionService } from '@app/services/communication/communication-subscriptions/communication-subscription.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FiltersService } from '@app/services/filters/filters.service';
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
import { of } from 'rxjs';
import { ExportWindowComponent } from './export-window.component';
import SpyObj = jasmine.SpyObj;

// tslint:disable:no-magic-numbers
// tslint:disable:max-file-line-count
describe('ExportWindowComponent', () => {
    let component: ExportWindowComponent;
    let fixture: ComponentFixture<ExportWindowComponent>;
    let editorService: EditorSelectorService;
    const drawingService = new DrawingService();
    const undoRedoService = new UndoRedoService(drawingService);
    let canvasTestHelper: CanvasTestHelper;
    let filterServiceSpy: jasmine.SpyObj<FiltersService>;
    let subscriptionServiceSpy: SpyObj<CommunicationSubscriptionService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        subscriptionServiceSpy = jasmine.createSpyObj('CommunicationSubscriptionService', ['imagePostImgurEventListener', 'postImageImgur']);

        filterServiceSpy = jasmine.createSpyObj('FiltersService', [
            'applyTransparentFilter',
            'applyGreyTonesFilter',
            'applyInvColorsFilter',
            'applyBlueLightFilter',
            'applyLogoFilter',
            'copyCtx',
        ]);
        filterServiceSpy.applyTransparentFilter.and.callFake(() => {
            return component.ctxToExport;
        });
        filterServiceSpy.applyGreyTonesFilter.and.callFake(() => {
            return component.ctxToExport;
        });
        filterServiceSpy.applyInvColorsFilter.and.callFake(() => {
            return component.ctxToExport;
        });
        filterServiceSpy.applyBlueLightFilter.and.callFake(() => {
            return component.ctxToExport;
        });
        filterServiceSpy.applyLogoFilter.and.callFake(() => {
            return component.ctxToExport;
        });
        filterServiceSpy.copyCtx.and.callFake(() => {
            return component.ctxToExport;
        });

        editorService = new EditorSelectorService(
            new PencilService(drawingService, new ColorService(drawingService), undoRedoService),
            new RectangleService(drawingService, new ColorService(drawingService), undoRedoService),
            new EllipseService(drawingService, new ColorService(drawingService), undoRedoService),
            new EraserService(drawingService, new ColorService(drawingService), undoRedoService),
            new LineService(drawingService, new ColorService(drawingService), undoRedoService),
            new ColorService(drawingService),
            new ContentSelectorService(drawingService, new ColorService(drawingService), undoRedoService),
            drawingService,
            undoRedoService,
            new PolygonService(drawingService, new ColorService(drawingService), undoRedoService),
            new SprayService(drawingService, new ColorService(drawingService), undoRedoService),
            new StampService(drawingService, new ColorService(drawingService), undoRedoService),
            new BucketService(drawingService, new ColorService(drawingService), undoRedoService),
            new RectangleSelectorService(drawingService),
            new FreeHandSelectorService(drawingService),
            new ClipboardService(
                new ContentSelectorService(drawingService, new ColorService(drawingService), undoRedoService),
                drawingService,
                undoRedoService,
            ),
        );

        TestBed.configureTestingModule({
            imports: [MaterialModule, ReactiveFormsModule, FormsModule, BrowserAnimationsModule, HttpClientModule, MatSnackBarModule],
            declarations: [ExportWindowComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorService },
                { provide: DrawingService, useValue: drawingService },
                { provide: FiltersService, useValue: filterServiceSpy },
                {
                    provide: MatSnackBarRef,
                    useValue: {},
                },
                {
                    provide: MAT_SNACK_BAR_DATA,
                    useValue: {},
                },
                { provide: CommunicationSubscriptionService, useValue: subscriptionServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportWindowComponent);
        component = fixture.componentInstance;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        TestBed.inject(MatSnackBarRef);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.ctxToExport = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.baseCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.drawingService.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        component.drawingService.previewCtx = previewCtxStub;
        component.drawingService.canvas = canvasTestHelper.canvas;
        component.editorService.isExporting = true;
        component.drawLogo(component.baseCtx, 0);
        subscriptionServiceSpy = TestBed.inject(CommunicationSubscriptionService) as jasmine.SpyObj<CommunicationSubscriptionService>;
        subscriptionServiceSpy.imagePostImgurEventListener.and.returnValue(of(new HttpResponse(true, '', undefined, undefined, '')));
        component.updateView();
        fixture.detectChanges();
    });

    it('1 should create', () => {
        expect(component).toBeTruthy();
    });
    it('2 getIsExporting() should call return the editor service isExportng attribute', () => {
        const isExportingEditor = editorService.isExporting;
        const result = component.getIsExporting();
        expect(result).toEqual(isExportingEditor);
    });
    it('3 export and cancel buttons should set the editor selector isExporting attribute to false', () => {
        const cancel = fixture.debugElement.query(By.css('#cancelButton'));
        cancel.triggerEventHandler('click', null);
        expect(component.editorService.isExporting).toBeFalse();

        component.editorService.isExporting = true;
        const exportBtn = fixture.debugElement.query(By.css('#exportButton1'));
        exportBtn.triggerEventHandler('click', null);
        expect(component.editorService.isExporting).toBeFalse();
    });
    it('4 only ctrl + e should call updateView ', () => {
        const updateViewSpy = spyOn(component, 'updateView');

        let pressKey = {
            code: 'KeyE',
            ctrlKey: false,
        } as KeyboardEvent;
        component.handleKeyDown(pressKey);
        expect(updateViewSpy).not.toHaveBeenCalled();

        pressKey = {
            code: 'KeyE',
            ctrlKey: true,
        } as KeyboardEvent;
        component.handleKeyDown(pressKey);
        expect(updateViewSpy).toHaveBeenCalled();
    });
    it('5 exportDrawing should set the file name to Untilted only if no name is entered ', () => {
        const form = document.getElementById('input') as HTMLInputElement;
        form.value = '';
        component.exportDrawing();
        expect(component.fileName).toEqual('Untitled');

        form.value = 'test';
        component.exportDrawing();
        expect(component.fileName).toEqual('test');
    });

    it('13 when transparent filter is selected, updateContext should call applyTransparentFilter only if png is selected', () => {
        component.format = 'png';
        component.filter = 'transparent';
        component.updateContext();
        expect(filterServiceSpy.applyTransparentFilter).toHaveBeenCalled();

        component.format = 'jpeg';
        component.updateContext();
        expect(filterServiceSpy.copyCtx).toHaveBeenCalled();
    });
    it('14 when none filter is selected, updateContext should not call the filter service', () => {
        component.filter = 'none';
        component.updateContext();
        expect(filterServiceSpy.copyCtx).toHaveBeenCalled();
    });
    it('15 when greyLevels filter is selected, updateContext should call applyGreyTonesFilter', () => {
        component.filter = 'greyLevels';
        component.updateContext();
        expect(filterServiceSpy.applyGreyTonesFilter).toHaveBeenCalled();
    });
    it('16 when invColors filter is selected, updateContext should call applyGreyTonesFilter', () => {
        component.filter = 'invColors';
        component.updateContext();
        expect(filterServiceSpy.applyInvColorsFilter).toHaveBeenCalled();
    });
    it('17 when polyLogo filter is selected, updateContext should call applyLogoFilter', () => {
        component.filter = 'polyLogo';
        component.updateContext();
        expect(filterServiceSpy.applyLogoFilter).toHaveBeenCalled();
    });
    it('18 when grid filter is selected, updateContext should call applyGridFilter', () => {
        component.filter = 'blueLight';
        component.updateContext();
        expect(filterServiceSpy.applyBlueLightFilter).toHaveBeenCalled();
    });
    it('19 change on format form should update component format', () => {
        const changeEvent = {
            value: 'jpeg',
        } as MatSelectChange;
        component.updateFormat(changeEvent);
        expect(component.format).toEqual('jpeg');
    });
    it('20 change on filter form should update component filter', () => {
        const changeEvent = {
            value: 'polyLogo',
        } as MatSelectChange;
        component.updateFilter(changeEvent);
        expect(component.filter).toEqual('polyLogo');
    });
    it('21 exportDrawing should call drawLogo is filter is polyLogo ', () => {
        const drawLogoSpy = spyOn(component, 'drawLogo');
        component.filter = 'polyLogo';
        component.exportDrawing();
        expect(drawLogoSpy).toHaveBeenCalled();
    });
    it('22 resizePreviewCanvas: should change canvas width', () => {
        drawingService.canvas.width = 150;
        drawingService.canvas.height = 100;
        const oldWidth = component.canvasWidth;
        const oldHeight = component.canvasHeight;
        component.resizePreviewCanvas();
        expect(component.canvasHeight).not.toEqual(oldHeight);
        expect(component.canvasWidth).not.toEqual(oldWidth);
    });

    it('23. should exit when click page depth is equal to 9', () => {
        const spyHideWindow = spyOn(component, 'hideWindow');
        const path: EventTarget[] = [];
        for (let i = 0; i < 9; i++) {
            path.push(window);
        }
        const mouseEvent = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
            composedPath(): EventTarget[] {
                return path;
            },
        } as MouseEvent;

        component.onClick(mouseEvent);
        expect(spyHideWindow).toHaveBeenCalled();
    });

    it('24. should not exit when click page depth is not equal to 9', () => {
        const spyHideWindow = spyOn(component, 'hideWindow');
        const path: EventTarget[] = [];
        for (let i = 0; i < 10; i++) {
            path.push(window);
        }
        const mouseEvent = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
            composedPath(): EventTarget[] {
                return path;
            },
        } as MouseEvent;

        component.onClick(mouseEvent);
        expect(spyHideWindow).not.toHaveBeenCalled();
    });

    it('25. pressing escape should exit view ', () => {
        const spyHideWindow = spyOn(component, 'hideWindow');

        const pressKey = {
            code: 'Escape',
        } as KeyboardEvent;
        component.handleKeyDown(pressKey);
        expect(spyHideWindow).toHaveBeenCalled();
    });

    it('26. pressing exportToImgur should call exportToImgur', () => {
        component.editorService.isExporting = true;
        const exportSpy = spyOn(component, 'exportToImgur');
        const exportBtn = fixture.debugElement.query(By.css('#exportButton2'));
        exportBtn.triggerEventHandler('click', null);
        expect(exportSpy).toHaveBeenCalled();
    });

    it('27. calling export to imgur should call commSub', () => {
        jasmine.clock().install();
        component.exportToImgur();
        jasmine.clock().tick(300);
        expect(subscriptionServiceSpy.postImageImgur).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('27. calling export to imgur should call commSub with correct data', () => {
        jasmine.clock().install();
        component.format = 'png';
        const imageUrl = component.ctxToExport.canvas.toDataURL('image/' + component.format);
        const imageData =
            component.format === 'png' ? imageUrl.replace(/^data:image\/png;base64,/, '') : imageUrl.replace(/^data:image\/jpeg;base64,/, '');
        component.exportToImgur();
        const formData = new FormData();
        formData.append('image', imageData);
        formData.append('type', `image/${component.format}`);
        jasmine.clock().tick(300);
        expect(subscriptionServiceSpy.postImageImgur).toHaveBeenCalledWith(formData);
        jasmine.clock().uninstall();
    });

    it('28. calling export to imgur should call commSub with correct data', () => {
        jasmine.clock().install();
        component.format = 'jpeg';
        const imageUrl = component.ctxToExport.canvas.toDataURL('image/' + component.format);
        const imageData =
            component.format === 'png' ? imageUrl.replace(/^data:image\/png;base64,/, '') : imageUrl.replace(/^data:image\/jpeg;base64,/, '');
        component.exportToImgur();
        const formData = new FormData();
        formData.append('image', imageData);
        formData.append('type', `image/${component.format}`);
        jasmine.clock().tick(300);
        expect(subscriptionServiceSpy.postImageImgur).toHaveBeenCalledWith(formData);
        jasmine.clock().uninstall();
    });

    it('29 should subscribe on message on ngOnInit with error', async () => {
        subscriptionServiceSpy.imagePostImgurEventListener.and.returnValue(of(new HttpResponse(false, '')));

        component.ngOnInit();
        fixture.detectChanges();
        expect(subscriptionServiceSpy.imagePostImgurEventListener).toHaveBeenCalled();
    });
});
