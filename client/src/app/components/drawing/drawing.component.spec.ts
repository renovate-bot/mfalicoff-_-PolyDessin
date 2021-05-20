import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MaterialModule } from '@app/angular-material';
import { Tool } from '@app/classes/tool';
import { Constants } from '@app/global/constants';
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
import { DrawingComponent } from './drawing.component';
// tslint:disable:typedef
// tslint:disable:max-file-line-count

class ToolStub extends Tool {}

describe('DrawingComponent', () => {
    // tslint:disable:no-magic-numbers
    // tslint:disable:no-empty
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawingStub: DrawingService;
    let editorSelectorStub: EditorSelectorService;
    let colorStub: ColorService;
    let mockDialog: MatDialog;

    beforeEach(async(() => {
        colorStub = new ColorService({} as DrawingService);
        const undoRedoService = new UndoRedoService(drawingStub);
        // @ts-ignore
        toolStub = new ToolStub({} as DrawingService, new ColorService(new DrawingService()));
        drawingStub = new DrawingService();
        editorSelectorStub = new EditorSelectorService(
            new PencilService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new RectangleService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new EllipseService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new EraserService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new LineService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new ColorService(drawingStub),
            new ContentSelectorService(drawingStub, new ColorService(drawingStub), undoRedoService),
            drawingStub,
            undoRedoService,
            new PolygonService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new SprayService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new StampService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new BucketService(drawingStub, new ColorService(drawingStub), undoRedoService),
            new RectangleSelectorService(drawingStub),
            new FreeHandSelectorService(drawingStub),
            new ClipboardService(
                new ContentSelectorService(drawingStub, new ColorService(drawingStub), undoRedoService),
                drawingStub,
                undoRedoService,
            ),
        );

        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [DrawingComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorSelectorStub },
                { provide: PencilService, useValue: toolStub },
                { provide: DrawingService, useValue: drawingStub },
                { provide: ColorService, useValue: colorStub },
            ],
        }).compileComponents();
        mockDialog = TestBed.inject(MatDialog);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('1 should create', () => {
        expect(component).toBeTruthy();
    });

    it('2 should occupy half the working space in width and height', () => {
        const height = component.drawingService.height;
        const width = component.drawingService.width;
        expect(height).toEqual(window.innerHeight / 2);
        expect(width).toEqual((window.innerWidth - Constants.SIDEBAR_WIDTH_CONST) / 2);
    });

    it(" 4 should call the tool's mouse move when receiving a mouse move event oonly if we are not currently resizing", () => {
        const event = { preventDefault(): void {} } as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onMouseMove');

        component.resizingX = true;
        component.resizingY = true;
        component.onMouseMove(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(event);

        component.resizingX = false;
        component.resizingY = false;
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" 5 should call the tool's mouse down when receiving a mouse down event only if window is not resizing", () => {
        const event = { preventDefault(): void {} } as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onMouseDown').and.callThrough();

        component.resizingX = true;
        component.resizingY = true;
        component.onMouseDown(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(event);

        component.resizingX = false;
        component.resizingY = false;

        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" 6 should call the tool's mouse up when receiving a mouse up event if window is not resizing", () => {
        component.resizingX = false;
        component.resizingY = false;
        const event = { preventDefault(): void {} } as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' 7 width and height should change when receiving a mouse up event and window is resizing', () => {
        component.resizingX = true;
        component.resizingY = true;
        component.drawingService.previewWidth = 500;
        component.drawingService.previewHeight = 500;
        const event = {} as MouseEvent;
        component.onMouseUp(event);

        expect(component.drawingService.width).toEqual(component.drawingService.previewWidth);
        expect(component.drawingService.height).toEqual(component.drawingService.previewHeight);
    });
    // tslint:disable-next-line: max-line-length
    it(' 9 previewWidth and previewHeight should change when receiving a mouse move event and window is resizing', () => {
        component.resizingX = true;
        component.resizingY = true;
        const event = {
            clientX: 1000,
            clientY: 1000,
            preventDefault(): void {},
        } as MouseEvent;
        const oldWidth = component.drawingService.previewWidth;
        const oldHeight = component.drawingService.previewHeight;
        component.onMouseMoveWindow(event);

        expect(component.drawingService.previewWidth).not.toEqual(oldWidth);
        expect(component.drawingService.previewHeight).not.toEqual(oldHeight);
    });
    it(' 11 previewWidth and previewHeight should not change if position is less than minimum size (250x250) when receiving a mouse move event and window is resizing', () => {
        component.resizingX = true;
        component.resizingY = true;
        const event = {
            clientX: 200,
            clientY: 200,
            preventDefault(): void {},
        } as MouseEvent;
        const oldWidth = component.drawingService.previewWidth;
        const oldHeight = component.drawingService.previewHeight;
        component.onMouseMoveWindow(event);

        expect(component.drawingService.previewWidth).toEqual(oldWidth);
        expect(component.drawingService.previewHeight).toEqual(oldHeight);
    });
    it('12 previewWidth and previewHeight should not change if on mouse move event if we are not resizing', () => {
        component.resizingX = false;
        component.resizingY = false;
        const event = {
            clientX: 1000,
            clientY: 1000,
            preventDefault(): void {},
        } as MouseEvent;
        const oldWidth = component.drawingService.previewWidth;
        const oldHeight = component.drawingService.previewHeight;
        component.onMouseMoveWindow(event);

        expect(component.drawingService.previewWidth).toEqual(oldWidth);
        expect(component.drawingService.previewHeight).toEqual(oldHeight);
    });
    it(' 13 mouse down on bottom right control point should set resizingX and resizingY to true', () => {
        const button = fixture.debugElement.query(By.css('#cornerDrag'));
        button.triggerEventHandler('mousedown', null);

        expect(component.resizingX).toBeTruthy();
        expect(component.resizingY).toBeTruthy();
    });
    it('14 mouse down on right control point should set resizingX to true', () => {
        const button = fixture.debugElement.query(By.css('#rightDrag'));
        button.triggerEventHandler('mousedown', null);

        expect(component.resizingX).toBeTruthy();
    });
    it(' 15 mouse down on right control point should set resizingY to true', () => {
        const button = fixture.debugElement.query(By.css('#bottomDrag'));
        button.triggerEventHandler('mousedown', null);

        expect(component.resizingY).toBeTruthy();
    });
    it(" 16 should call the tool's mouse out when receiving a mouse out event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onMouseOut');
        component.onMouseOut(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(" 17 should call the tool's mouse over when receiving a mouse over event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onMouseOver');
        component.onMouseOver(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(" 18 should not call the editor selector's handleKeyDown when receiving a keyDown event that is not a shortcut", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'handleKeyDown');
        component.handleKeyDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(" 19 should call the tool's handleKeyUp when receiving a keyUp event", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'handleKeyUp');
        component.handleKeyUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(" 20 should call the tool's onClick when receiving a onClick event only if there is no double click", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onClick');
        jasmine.clock().install();
        component.onClick(event);
        jasmine.clock().tick(60);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
        jasmine.clock().uninstall();

        jasmine.clock().install();
        component.onClick(event);
        component.preventClick = true;
        jasmine.clock().tick(60);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
        jasmine.clock().uninstall();
    });
    it("21 should call the tool's onDoubleClick when receiving a dblclick event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(editorSelectorStub, 'onDoubleClick');
        component.onDoubleClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    describe('control key handler', () => {
        beforeEach(() => {
            editorSelectorStub.isExporting = false;
            editorSelectorStub.isSaving = false;
            editorSelectorStub.isLoading = false;
        });

        it('22. should call ctrl handler is ctrl is true in event', () => {
            const keyEvent = {
                ctrlKey: true,
            } as KeyboardEvent;

            const spyCtrlHandler = spyOn(component, 'ctrlHandler');
            component.handleKeyDown(keyEvent);
            expect(spyCtrlHandler).toHaveBeenCalled();
        });

        it('23. should not change booleans if window is open', () => {
            editorSelectorStub.isSaving = true;
            const keyEvent = {
                ctrlKey: true,
                code: 'KeyE',
                preventDefault() {},
            } as KeyboardEvent;

            component.ctrlHandler(keyEvent);
            expect(editorSelectorStub.isExporting).toEqual(false);
        });

        it('24. should open saving window', () => {
            const matDialogSpy = spyOn(mockDialog, 'open');

            const keyEvent = {
                ctrlKey: true,
                code: 'KeyS',
                preventDefault() {},
            } as KeyboardEvent;

            component.ctrlHandler(keyEvent);
            expect(editorSelectorStub.isSaving).toEqual(true);
            expect(matDialogSpy).toHaveBeenCalled();
        });

        it('25. should open gallery window', () => {
            const matDialogSpy = spyOn(mockDialog, 'open');

            const keyEvent = {
                ctrlKey: true,
                code: 'KeyG',
                preventDefault() {},
            } as KeyboardEvent;

            component.ctrlHandler(keyEvent);
            expect(editorSelectorStub.isLoading).toEqual(true);
            expect(matDialogSpy).toHaveBeenCalled();
        });

        it('26. should open export window', () => {
            const keyEvent = {
                ctrlKey: true,
                code: 'KeyE',
                preventDefault() {},
            } as KeyboardEvent;

            component.ctrlHandler(keyEvent);
            expect(editorSelectorStub.isExporting).toEqual(true);
        });

        it('27. should default to editor service keydown', () => {
            const editorKeyDownSpy = spyOn(editorSelectorStub, 'handleKeyDown');
            const keyEvent = {
                ctrlKey: true,
                code: 'KeyZ',
                preventDefault() {},
            } as KeyboardEvent;

            component.ctrlHandler(keyEvent);
            expect(editorSelectorStub.isExporting).toEqual(false);
            expect(editorKeyDownSpy).toHaveBeenCalled();
        });
    });
});
