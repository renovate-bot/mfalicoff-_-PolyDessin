import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ContentSelectorResizeComponent } from './content-selector-preview.component';
// tslint:disable:no-empty
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
// tslint:disable:max-file-line-count
// tslint:disable:no-string-literal
describe('ContentSelectorPreviewComponent', () => {
    let component: ContentSelectorResizeComponent;
    let fixture: ComponentFixture<ContentSelectorResizeComponent>;
    let selectorService: ContentSelectorService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previousCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let mouseEventLeft5: MouseEvent;
    let mouseEventLeft7: MouseEvent;
    let undoRedoSpy: UndoRedoService;

    beforeEach(async(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearContext', 'canvasIsBlank']);
        undoRedoSpy = new UndoRedoService(drawServiceSpy);
        selectorService = new ContentSelectorService(drawServiceSpy, new ColorService(new DrawingService()), undoRedoSpy);

        TestBed.configureTestingModule({
            declarations: [ContentSelectorResizeComponent],
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ContentSelectorService, useValue: selectorService },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContentSelectorResizeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        previousCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCtxStub.canvas.width = 10;
        baseCtxStub.canvas.height = 10;
        previewCtxStub.canvas.width = 10;
        previewCtxStub.canvas.height = 10;
        selectionCtxStub.canvas.width = 10;
        selectionCtxStub.canvas.height = 10;
        previousCtxStub.canvas.width = 10;
        previousCtxStub.canvas.height = 10;
        drawServiceSpy.canvas = canvasTestHelper.canvas;
        drawServiceSpy.canvas.width = 10;
        drawServiceSpy.canvas.height = 10;
        selectorService.selectorTool.unchangedSelectedArea = canvasTestHelper.canvas;
        selectorService.selectorTool.unchangedSelectedArea.width = 10;
        selectorService.selectorTool.unchangedSelectedArea.height = 10;
        selectorService.selectorTool.selectedArea = canvasTestHelper.canvas;
        selectorService.selectorTool.selectedArea.width = 10;
        selectorService.selectorTool.selectedArea.height = 10;

        component.drawingService.baseCtx = baseCtxStub;
        component.drawingService.canvas = canvasTestHelper.canvas; // Jasmine doesnt copy properties with underlying data
        component.drawingService.previewCtx = previewCtxStub;
        component.drawingService.selectorCtx = previewCtxStub;
        component.drawingService.previousCtx = previewCtxStub;

        mouseEventLeft5 = {
            offsetX: 5,
            offsetY: 5,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
        mouseEventLeft7 = {
            offsetX: 7,
            offsetY: 7,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('1 getPointsX: should return the selector service x1 and x2', () => {
        selectorService.selectorTool.start.x = 2;
        selectorService.selectorTool.end.x = 2;
        expect(component.getPointsX()).toEqual({ x1: 2, x2: 2 });
    });
    it('2 getPointsY: should return the selector service y1 and y2', () => {
        selectorService.selectorTool.start.y = 2;
        selectorService.selectorTool.end.y = 2;
        expect(component.getPointsY()).toEqual({ y1: 2, y2: 2 });
    });
    it('3 getIsActive: should return value in the isActive boolean of the selector service', () => {
        selectorService.drawingService.selectionIsActive = false;
        expect(component.getIsActive()).toBeFalse();
        selectorService.drawingService.selectionIsActive = true;
        expect(component.getIsActive()).toBeTrue();
    });
    it('4 isResizingStartX: should set resizingStartX and isResizing to true', () => {
        selectorService.isResizing = false;
        component.resizingStartX = false;
        component.initializeResizingStartX();
        expect(component.resizingStartX).toBeTrue();
        expect(selectorService.isResizing).toBeTrue();
    });
    it('4 isResizingEndX: should set resizingEndX and isResizing to true', () => {
        selectorService.isResizing = false;
        component.resizingEndX = false;
        component.initializeResizingEndX();
        expect(component.resizingEndX).toBeTrue();
        expect(selectorService.isResizing).toBeTrue();
    });
    it('5 isResizingStartY: should set resizingStartY and isResizing to true', () => {
        selectorService.isResizing = false;
        component.resizingStartY = false;
        component.initializeResizingStartY();
        expect(component.resizingStartY).toBeTrue();
        expect(selectorService.isResizing).toBeTrue();
    });
    it('6 isResizingEndY: should set resizingEndY and isResizing to true', () => {
        selectorService.isResizing = false;
        component.resizingEndY = false;
        component.initializeResizingEndY();
        expect(component.resizingEndY).toBeTrue();
        expect(selectorService.isResizing).toBeTrue();
    });

    it('11 reset: should set resize booleans to false', () => {
        component.resizingStartY = true;
        component.resizingStartX = true;
        component.resizingEndY = true;
        component.resizingEndX = true;
        selectorService.isResizing = true;
        component.resetBools();
        expect(component.resizingStartY).toBeFalse();
        expect(component.resizingStartX).toBeFalse();
        expect(component.resizingEndY).toBeFalse();
        expect(component.resizingEndX).toBeFalse();
        expect(selectorService.isResizing).toBeFalse();
    });
    it('12 onMouseUp: should call reset', () => {
        const resetSpy = spyOn(component, 'resetBools');
        component.onMouseUp();
        expect(resetSpy).toHaveBeenCalled();
    });
    it('13 resizeSelection: if resizingStartX, should set the mirror bool and call scaleSelection', () => {
        const scaleSelectionSpy = spyOn(selectorService.selectorTool, 'scaleSelection');
        component.resizingStartX = true;
        selectorService.selectorTool.endPosBeforeResize.x = 6;
        component.resizeSelection(mouseEventLeft7);
        expect(component.mirrorX).toBeTrue();

        component.resizeSelection(mouseEventLeft5);
        expect(scaleSelectionSpy).toHaveBeenCalled();
        expect(component.mirrorX).toBeFalse();
    });
    it('14 resizeSelection: if resizingStartY, should set the mirror bool and call scaleSelection', () => {
        const scaleSelectionSpy = spyOn(selectorService.selectorTool, 'scaleSelection');
        component.resizingStartY = true;
        selectorService.selectorTool.endPosBeforeResize.y = 6;
        component.resizeSelection(mouseEventLeft7);
        expect(component.mirrorY).toBeTrue();

        component.resizeSelection(mouseEventLeft5);
        expect(scaleSelectionSpy).toHaveBeenCalled();
        expect(component.mirrorY).toBeFalse();
    });
    it('15 resizeSelection: if resizingEndX, should set the mirror bool and call scaleSelection', () => {
        const scaleSelectionSpy = spyOn(selectorService.selectorTool, 'scaleSelection');
        component.resizingEndX = true;
        selectorService.selectorTool.startPosBeforeResize.x = 6;
        component.resizeSelection(mouseEventLeft7);
        expect(component.mirrorX).toBeFalse();

        component.resizeSelection(mouseEventLeft5);
        expect(scaleSelectionSpy).toHaveBeenCalled();
        expect(component.mirrorX).toBeTrue();
    });
    it('16 resizeSelection: if resizingEndY, should set the mirror bool and call scaleSelection', () => {
        const scaleSelectionSpy = spyOn(selectorService.selectorTool, 'scaleSelection');
        component.resizingEndY = true;
        selectorService.selectorTool.startPosBeforeResize.y = 6;
        component.resizeSelection(mouseEventLeft7);
        expect(component.mirrorY).toBeFalse();

        component.resizeSelection(mouseEventLeft5);
        expect(scaleSelectionSpy).toHaveBeenCalled();
        expect(component.mirrorY).toBeTrue();
    });
    it('17 updatePathDataX: if resizingStartX, should change all values except for highestXIndex ', () => {
        component.resizingStartX = true;
        component.mirrorX = false;
        const initialPathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.pathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.name = 'freehand';
        component.updatePathDataX(3);
        expect(selectorService.selectorTool.pathData[0].x).not.toEqual(initialPathData[0].x);
        expect(selectorService.selectorTool.pathData[1].x).toEqual(initialPathData[1].x + 2);
        expect(selectorService.selectorTool.pathData[2].x).not.toEqual(initialPathData[2].x);
    });
    it('18 updatePathDataX: if resizingEndX, should change all values except for lowestXIndex ', () => {
        component.resizingEndX = true;
        component.mirrorX = true;
        const initialPathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.pathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.name = 'freehand';
        component.updatePathDataX(3);
        expect(selectorService.selectorTool.pathData[0].x).toEqual(initialPathData[0].x - 2);
        expect(selectorService.selectorTool.pathData[1].x).not.toEqual(initialPathData[1].x);
        expect(selectorService.selectorTool.pathData[2].x).not.toEqual(initialPathData[2].x);
    });
    it('19 updatePathDataY: if resizingStartY, should change all values except for highestYIndex ', () => {
        component.resizingStartY = true;
        component.mirrorY = false;
        const initialPathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.pathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.name = 'freehand';
        component.updatePathDataY(3);
        expect(selectorService.selectorTool.pathData[0].y).not.toEqual(initialPathData[0].y);
        expect(selectorService.selectorTool.pathData[1].y).toEqual(initialPathData[1].y + 2);
        expect(selectorService.selectorTool.pathData[2].y).not.toEqual(initialPathData[2].y);
    });
    it('20 updatePathDataY: if resizingEndY, should change all values except for lowestYIndex ', () => {
        component.resizingEndY = true;
        component.mirrorY = true;
        const initialPathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.pathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.name = 'freehand';
        component.updatePathDataY(3);
        expect(selectorService.selectorTool.pathData[0].y).toEqual(initialPathData[0].y - 2);
        expect(selectorService.selectorTool.pathData[1].y).not.toEqual(initialPathData[1].y);
        expect(selectorService.selectorTool.pathData[2].y).not.toEqual(initialPathData[2].y);
    });
    it('21 onMouseUp: should call adjustPathData, updatePreviousCtx, redrawSelectedArea and pushDataToUndo', () => {
        const adjustPathDataSpy = spyOn(component, 'adjustPathData');
        const updatePreviousCtxSpy = spyOn(selectorService.selectorTool, 'updatePreviousCtx');
        const redrawSelectedAreaSpy = spyOn(selectorService.selectorTool, 'redrawSelectedArea');
        const pushDataToUndoSpy = spyOn(component, 'pushDataToUndo');
        selectorService.isResizing = true;
        selectorService.selectorTool.name = 'freehand';
        component.onMouseUp();
        expect(adjustPathDataSpy).toHaveBeenCalled();

        selectorService.isResizing = true;
        selectorService.selectorTool.name = 'rectangle';
        component.onMouseUp();
        expect(updatePreviousCtxSpy).toHaveBeenCalled();
        expect(redrawSelectedAreaSpy).toHaveBeenCalled();
        expect(pushDataToUndoSpy).toHaveBeenCalled();
    });
    it('22 adjustPathData: if resizing the start, should call updatePathDataX with the difference in start positions', () => {
        const updatePathDataXSpy = spyOn(component, 'updatePathDataX');
        selectorService.selectorTool.startPosBeforeResize.x = 10;
        selectorService.selectorTool.start.x = 0;
        selectorService.selectorTool.startPosBeforeResize.y = 0;
        selectorService.selectorTool.start.y = 0;
        selectorService.selectorTool.endPosBeforeResize.y = 0;
        selectorService.selectorTool.end.y = 0;
        selectorService.selectorTool.pathData = [{ x: 0, y: 0 }];
        component.adjustPathData();
        expect(updatePathDataXSpy).toHaveBeenCalledWith(-10);
    });
    it('23 adjustPathData: if resizing the end, should call updatePathDataX with the difference in end positions', () => {
        const updatePathDataXSpy = spyOn(component, 'updatePathDataX');
        selectorService.selectorTool.endPosBeforeResize.x = 10;
        selectorService.selectorTool.end.x = 0;
        selectorService.selectorTool.startPosBeforeResize.y = 0;
        selectorService.selectorTool.start.y = 0;
        selectorService.selectorTool.endPosBeforeResize.y = 0;
        selectorService.selectorTool.end.y = 0;
        selectorService.selectorTool.pathData = [{ x: 0, y: 0 }];
        component.adjustPathData();
        expect(updatePathDataXSpy).toHaveBeenCalledWith(-10);
    });
    it('24 adjustPathData: if resizing the start, should call updatePathDataY with the difference in start positions', () => {
        const updatePathDataYSpy = spyOn(component, 'updatePathDataY');
        selectorService.selectorTool.startPosBeforeResize.y = 10;
        selectorService.selectorTool.start.y = 0;
        selectorService.selectorTool.startPosBeforeResize.x = 0;
        selectorService.selectorTool.start.x = 0;
        selectorService.selectorTool.endPosBeforeResize.x = 0;
        selectorService.selectorTool.end.x = 0;
        selectorService.selectorTool.pathData = [{ x: 0, y: 0 }];
        component.adjustPathData();
        expect(updatePathDataYSpy).toHaveBeenCalledWith(-10);
    });
    it('25 adjustPathData: if resizing the end, should call updatePathDataY with the difference in end positions', () => {
        const updatePathDataYSpy = spyOn(component, 'updatePathDataY');
        selectorService.selectorTool.endPosBeforeResize.y = 10;
        selectorService.selectorTool.end.y = 0;
        selectorService.selectorTool.startPosBeforeResize.x = 0;
        selectorService.selectorTool.start.x = 0;
        selectorService.selectorTool.endPosBeforeResize.x = 0;
        selectorService.selectorTool.end.x = 0;
        selectorService.selectorTool.pathData = [{ x: 0, y: 0 }];
        component.adjustPathData();
        expect(updatePathDataYSpy).toHaveBeenCalledWith(-10);
    });
    it('26 pushDataToUndo: only if firstResizeDone, should call pop before pushing to undo array', () => {
        selectorService.firstResizeDone = false;
        const popSpy = spyOn(undoRedoSpy['dataUndoArray'], 'pop');
        const pushSpy = spyOn(undoRedoSpy['dataUndoArray'], 'push');
        component.pushDataToUndo();
        expect(popSpy).not.toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
        selectorService.firstResizeDone = true;
        component.pushDataToUndo();
        expect(popSpy).toHaveBeenCalled();
    });
    it('27 clearUnderSelection: if isResizing, should not call updatePreviousCtx', () => {
        selectorService.isResizing = true;
        const updatePreviousCtxSpy = spyOn(selectorService.selectorTool, 'updatePreviousCtx');
        component.clearUnderSelection();
        expect(updatePreviousCtxSpy).not.toHaveBeenCalled();
    });
    it('28 clearUnderSelection: if firstResizeDone, should not call clearUnderSelection', () => {
        selectorService.firstResizeDone = true;
        const clearUnderSelectionSpy = spyOn(selectorService.selectorTool, 'clearUnderSelection');
        component.clearUnderSelection();
        expect(clearUnderSelectionSpy).not.toHaveBeenCalled();
    });
    it('29 updatePathDataX and updatePathDataY: should do nothing if selection is rectangle ', () => {
        const initialPathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.pathData = [
            { x: 2, y: 2 },
            { x: 10, y: 10 },
            { x: 7, y: 7 },
            { x: 2, y: 2 },
        ];
        selectorService.selectorTool.name = 'rectangle';
        component.updatePathDataX(3);
        component.updatePathDataY(3);
        expect(selectorService.selectorTool.pathData[0]).toEqual(initialPathData[0]);
        expect(selectorService.selectorTool.pathData[1]).toEqual(initialPathData[1]);
        expect(selectorService.selectorTool.pathData[2]).toEqual(initialPathData[2]);
    });
});
