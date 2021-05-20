import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Selector } from '@app/classes/selector';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ContentSelectorService } from './content-selector.service';
import { RectangleSelectorService } from './rectangle-selector/rectangle-selector.service';

describe('ContentSelectorService', () => {
    let service: ContentSelectorService;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoSpy: UndoRedoService;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let previousCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let selectorTool: Selector;
    let mouseEventLeft: MouseEvent;
    let mouseEventRight: MouseEvent;
    // tslint:disable:no-magic-numbers
    // tslint:disable:no-string-literal
    // tslint:disable:max-file-line-count
    // tslint:disable:no-empty
    // tslint:disable:typedef
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoSpy = new UndoRedoService(drawServiceSpy);
        selectorTool = new RectangleSelectorService(drawServiceSpy);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
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

        service = TestBed.inject(ContentSelectorService);
        service.selectorTool = selectorTool;
        service.selectorTool.selectedArea = canvasTestHelper.canvas;
        // Configuration du spy du service

        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectorCtx = previewCtxStub;
        service.drawingService.previousCtx = previewCtxStub;

        spyOn(drawServiceSpy.previewCtx, 'drawImage');
        spyOn(service.selectorTool, 'redrawSelectedArea');

        data = {
            name: 'selector',
            path: [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
            ] as Vec2[],
            lineWidth: 2,
            diameterSize: 4,
            polygonSideNumber: 5,
            polygonBorderFull: false,
            color: ['red', 'blue'] as string[],
            toolPropriety: 'plein',
            finalPosition: { x: 20, y: 20 } as Vec2,
            initialPosition: { x: 10, y: 10 } as Vec2,
            initialArea: document.createElement('canvas'),
            selectedArea: document.createElement('canvas'),
            finalArea: document.createElement('canvas'),
        } as Data;

        mouseEventLeft = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;

        mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
            preventDefault: () => {},
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('1 onMouseDown: getPositionFromMouse should only be called if select is not resizine an dmouse is down on left click', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.callThrough();
        service.isResizing = true;
        service.onMouseDown(mouseEventRight);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();

        service.isResizing = false;
        service.onMouseDown(mouseEventRight);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();

        service.isResizing = false;
        service.onMouseDown(mouseEventLeft);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });
    it('2 onMouseDown: when dragging a select, first drag should call fillRect and other ones should call putImageData', () => {
        const clearUnderSelectionSpy = spyOn(service.selectorTool, 'clearUnderSelection');
        const isMouseInSelectZoneSpy = spyOn(service, 'isMouseInSelectZone').and.callFake(() => {
            return true;
        });
        service.selectorTool.start.x = 0;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.x = 5;
        service.selectorTool.end.y = 5;
        service.drawingService.areaIsSelected = true;
        service.isResizing = false;
        service.firstDragDone = false;
        service.onMouseDown(mouseEventLeft);
        expect(isMouseInSelectZoneSpy).toHaveBeenCalled();
        expect(clearUnderSelectionSpy).toHaveBeenCalled();

        service.firstDragDone = true;
        service.onMouseDown(mouseEventLeft);
    });
    it('3 onMouseDown: when dragging outside selected area, a new area should start', () => {
        service.drawingService.areaIsSelected = false;
        service.isResizing = false;
        service.onMouseDown(mouseEventLeft);
        expect(service.selectorTool.start.x).toEqual(mouseEventLeft.offsetX);
        expect(service.selectorTool.end.x).toEqual(mouseEventLeft.offsetX);
        expect(service.selectorTool.start.y).toEqual(mouseEventLeft.offsetY);
        expect(service.selectorTool.end.y).toEqual(mouseEventLeft.offsetY);
    });
    it('4 onMouseDown: if tool is rectangle or path is closed and creating a new area, should call the selectorTool mouseDown', () => {
        service.drawingService.areaIsSelected = false;
        service.needToResetSelection = false;
        service.isResizing = false;
        service.mouseDown = true;
        const onMouseDownSpy = spyOn(service.selectorTool, 'onMouseDown');
        service.selectorTool.name = 'freehand';
        service.selectorTool.pathClosed = false;
        service.onMouseDown(mouseEventLeft);
        expect(onMouseDownSpy).not.toHaveBeenCalled();
        service.needToResetSelection = false;
        service.selectorTool.name = 'rectangle';
        service.selectorTool.pathClosed = true;
        service.onMouseDown(mouseEventLeft);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });
    it('5 onMouseMove: reszing, should not call onMouseMove or updatePathData', () => {
        service.isResizing = true;
        const onMouseMoveSpy = spyOn(service.selectorTool, 'onMouseMove');
        const updatePathDataSpy = spyOn(service.selectorTool, 'updatePathData');
        service.onMouseMove(mouseEventLeft);

        service.isResizing = false;
        service.selectorTool.name = 'freehand';
        service.selectorTool.pathClosed = false;
        service.onMouseMove(mouseEventLeft);
        expect(onMouseMoveSpy).not.toHaveBeenCalled();
        expect(updatePathDataSpy).not.toHaveBeenCalled();
    });

    it('5 onMouseMove: when area is selected, redrawSelectedArea should be called', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.needToResetSelection = true;
        service.drawingService.areaIsSelected = true;
        service.onMouseMove(mouseEventLeft);
        expect(service.selectorTool.redrawSelectedArea).toHaveBeenCalled();
    });
    it('7 onMouseMove: if area is not selected, the selectorTool onMouseMove should be called', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.needToResetSelection = true;
        service.drawingService.areaIsSelected = false;
        const onMouseMoveSpy = spyOn(service.selectorTool, 'onMouseMove');
        service.onMouseMove(mouseEventLeft);
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });
    it('8 onMouseMove: if area is not selected, positions should not increment if selection is not still in canvas', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.drawingService.areaIsSelected = false;
        service.selectorTool.start.x = 0;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.x = 0;
        service.selectorTool.end.y = 0;
        service.onMouseMove(mouseEventLeft);
        expect(service.selectorTool.start.x).toEqual(0); // should not have changed
        expect(service.selectorTool.start.y).toEqual(0);
        expect(service.selectorTool.end.x).toEqual(0);
        expect(service.selectorTool.end.y).toEqual(0);
    });
    it('9 onMouseUp: should update baseCtx and previousCtx', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.needToResetSelection = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.x = 0;
        service.selectorTool.end.y = 0;
        service.onMouseUp(mouseEventLeft);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('10 onMouseUp: should update baseCtx and previousCtx', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.needToResetSelection = true;
        drawServiceSpy.areaIsSelected = true;
        const pushDataToUndoSpy = spyOn(service, 'pushDataToUndo');
        service.onMouseUp(mouseEventLeft);
        expect(pushDataToUndoSpy).toHaveBeenCalled();
    });
    it('11 onMouseDown: if needToResetSelection is true, should call unselect', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.drawingService.areaIsSelected = false;
        service.needToResetSelection = true;
        service.selectorTool.name = 'freehand';
        service.selectorTool.pathClosed = false;
        const unselectSpy = spyOn(service, 'unselect');
        service.onMouseDown(mouseEventLeft);
        expect(unselectSpy).not.toHaveBeenCalled();

        service.selectorTool.name = 'rectangle';
        service.isResizing = false;
        service.mouseDown = true;
        service.drawingService.areaIsSelected = false;
        service.needToResetSelection = true;
        service.onMouseDown(mouseEventLeft);
        expect(unselectSpy).toHaveBeenCalled();
    });
    it('12 onMouseUp: if area is not selected and coordinates are not inversed, invertXCoords and invertYCoords should not be called', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.drawingService.areaIsSelected = false;
        service.selectorTool.start.x = 4;
        service.selectorTool.start.y = 4;
        service.selectorTool.end.x = 5;
        service.selectorTool.end.y = 5;
        service.onMouseUp(mouseEventLeft);
        expect(service.selectorTool.start.x).toEqual(4);
        expect(service.selectorTool.start.y).toEqual(4);
        expect(service.selectorTool.end.x).toEqual(5);
        expect(service.selectorTool.end.y).toEqual(5);
    });
    it('12 onMouseUp: if area is not selected and coordinates are not inversed, invertXCoords and invertYCoords should not be called', () => {
        service.isResizing = false;
        service.mouseDown = true;
        service.needToResetSelection = true;
        service.drawingService.areaIsSelected = false;
        service.selectorTool.name = 'freehand';
        service.selectorTool.pathClosed = false;
        spyOn(service.selectorTool, 'onMouseUp');
        service.onMouseUp(mouseEventLeft);
        expect(service.drawingService.areaIsSelected).toBeFalse();
    });

    it('13 isMouseInSelectZone: should return true only if x and y are in the selected zone', () => {
        service.selectorTool.start.x = 2;
        service.selectorTool.start.y = 2;
        service.selectorTool.end.x = 4;
        service.selectorTool.end.y = 4;
        expect(service.isMouseInSelectZone(2, 2)).toBeTrue();
        expect(service.isMouseInSelectZone(4, 4)).toBeTrue();
        expect(service.isMouseInSelectZone(2, 4)).toBeTrue();
        expect(service.isMouseInSelectZone(1, 1)).toBeFalse();
        expect(service.isMouseInSelectZone(5, 5)).toBeFalse();
        expect(service.isMouseInSelectZone(2, 5)).toBeFalse();
        expect(service.isMouseInSelectZone(5, 2)).toBeFalse();
    });

    it('26 handleKeyDown: first shift+mouseDown should call redrawPreviewContext ', () => {
        const shift = {
            key: 'Shift',
            preventDefault() {},
        } as KeyboardEvent;
        service.mouseDown = true;
        const updateAfterShiftSpy = spyOn(service.selectorTool, 'updateAfterShift');
        service.handleKeyDown(shift);
        expect(updateAfterShiftSpy).toHaveBeenCalled();
    });
    it('27 handleKeyDown: ctrl+A should call selectAll ', () => {
        const ctrlA = {
            ctrlKey: true,
            code: 'KeyA',
            preventDefault: () => {},
        } as KeyboardEvent;
        const selectAllSpy = spyOn(service, 'selectAll');
        service.handleKeyDown(ctrlA);
        expect(selectAllSpy).toHaveBeenCalled();
    });
    it('28 handleKeyDown: escape should call unselect ', () => {
        const escape = {
            key: 'Escape',
            preventDefault() {},
        } as KeyboardEvent;
        const unselectSpy = spyOn(service, 'unselect');
        service.handleKeyDown(escape);
        expect(unselectSpy).toHaveBeenCalled();
    });
    it('29 handleKeyUp: if shift is pressed and mouseDown is true, should call selectorTool.redrawSelectedArea', () => {
        const shift = {
            key: 'Shift',
        } as KeyboardEvent;
        service.handleKeyUp(shift);
        service.mouseDown = false;
        expect(service.selectorTool.redrawSelectedArea).not.toHaveBeenCalled();
        service.mouseDown = true;
        service.handleKeyUp(shift);
        expect(service.selectorTool.redrawSelectedArea).toHaveBeenCalled();
    });

    it('31 resetTool: should call unselect ', () => {
        const unselectSpy = spyOn(service, 'unselect');
        service.resetTool();
        expect(unselectSpy).toHaveBeenCalled();
    });

    it('37 startRefreshTimer: should call startRefreshTimer again if some arrow is pressed ', () => {
        jasmine.clock().install();
        service.arrowDown = true;
        service.startRefreshTimer();
        const startRefreshTimerSpy = spyOn(service, 'startRefreshTimer').and.callThrough();
        jasmine.clock().tick(200);
        service.arrowDown = false;
        expect(startRefreshTimerSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
    it('38 startRefreshTimer: should not call startRefreshTimer again if no arrows are pressed ', () => {
        jasmine.clock().install();
        service.startRefreshTimer();
        const startRefreshTimerSpy = spyOn(service, 'startRefreshTimer').and.callThrough();
        jasmine.clock().tick(200);
        expect(startRefreshTimerSpy).not.toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
    it('39 resetTimers: should only reset all timers if no arrow is pressed ', () => {
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        service.data.initialPosition = { x: 0, y: 0 };
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        service.arrowDown = true;
        service.resetTimers();
        expect(clearTimeoutSpy).not.toHaveBeenCalled();
        service.arrowDown = false;
        service.resetTimers();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
    it('40 handleKeyUp: if arrowDown is pressed, arrowKeyupdate should be called and the arrowDown should become false ', () => {
        service.data.initialPosition = { x: 0, y: 0 };
        const arrowDownEvent = {
            key: 'ArrowDown',
        } as KeyboardEvent;
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyUp(arrowDownEvent);
        expect(arrowKeyUpdateSpy).toHaveBeenCalled();
        expect(service.arrowDown).toBeFalse();
    });
    it('41 handleKeyUp: if ArrowLeft is pressed, arrowKeyupdate should be called and the ArrowLeft should become false ', () => {
        service.data.initialPosition = { x: 0, y: 0 };
        const arrowDownEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyUp(arrowDownEvent);
        expect(arrowKeyUpdateSpy).toHaveBeenCalled();
        expect(service.arrowLeft).toBeFalse();
    });
    it('42 handleKeyUp: if ArrowRight is pressed, arrowKeyupdate should be called and the ArrowRight should become false ', () => {
        service.data.initialPosition = { x: 0, y: 0 };
        const arrowDownEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyUp(arrowDownEvent);
        expect(arrowKeyUpdateSpy).toHaveBeenCalled();
        expect(service.arrowRight).toBeFalse();
    });
    it('43 handleKeyUp: if ArrowUp is pressed, arrowKeyupdate should be called and the ArrowUp should become false ', () => {
        service.data.initialPosition = { x: 0, y: 0 };
        const arrowDownEvent = {
            key: 'ArrowUp',
        } as KeyboardEvent;
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyUp(arrowDownEvent);
        expect(arrowKeyUpdateSpy).toHaveBeenCalled();
        expect(service.arrowUp).toBeFalse();
    });
    it('44 handleKeyDown: if arrowDown is pressed, the arrowDown should become true ', () => {
        spyOn(service, 'startRefreshTimer');
        const arrowDownEvent = {
            key: 'ArrowDown',
            preventDefault() {},
        } as KeyboardEvent;
        service.handleKeyDown(arrowDownEvent);
        window.clearTimeout(service.delayTimer);
        window.clearTimeout(service.refreshTimer);
        expect(service.arrowDown).toBeTrue();
    });
    it('45 handleKeyDown: if ArrowLeft is pressed, the ArrowLeft should become true ', () => {
        spyOn(service, 'startRefreshTimer');
        const arrowDownEvent = {
            key: 'ArrowLeft',
            preventDefault() {},
        } as KeyboardEvent;
        service.handleKeyDown(arrowDownEvent);
        window.clearTimeout(service.delayTimer);
        expect(service.arrowLeft).toBeTrue();
    });
    it('46 handleKeyDown: if ArrowRight is pressed, the ArrowRight should become true ', () => {
        spyOn(service, 'startRefreshTimer');
        const arrowDownEvent = {
            key: 'ArrowRight',
            preventDefault() {},
        } as KeyboardEvent;
        service.handleKeyDown(arrowDownEvent);
        window.clearTimeout(service.delayTimer);
        expect(service.arrowRight).toBeTrue();
    });
    it('47 handleKeyDown: if ArrowUp is pressed, the ArrowUp should become true ', () => {
        spyOn(service, 'startRefreshTimer');
        const arrowDownEvent = {
            key: 'ArrowUp',
            preventDefault() {},
        } as KeyboardEvent;
        service.handleKeyDown(arrowDownEvent);
        window.clearTimeout(service.delayTimer);
        expect(service.arrowUp).toBeTrue();
    });
    it('48 handleKeyDown: if some arrows are pressed, should not call arrowKeyUpdate', () => {
        spyOn(service, 'startRefreshTimer');
        service.arrowDown = true;
        const arrowDownEvent = {
            key: 'ArrowUp',
            preventDefault() {},
        } as KeyboardEvent;
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyDown(arrowDownEvent);
        window.clearTimeout(service.delayTimer);
        expect(arrowKeyUpdateSpy).not.toHaveBeenCalled();
    });
    it('49 handleKeyDown: if no arrow is pressed, should call selectorTools clearUnderSelection', () => {
        jasmine.clock().install();
        spyOn(service, 'startRefreshTimer');
        service.firstDragDone = false;
        service.drawingService.areaIsSelected = true;
        const arrowDownEvent = {
            key: 'ArrowUp',
            preventDefault() {},
        } as KeyboardEvent;
        const clearUnderSelectionSpy = spyOn(service.selectorTool, 'clearUnderSelection');
        const arrowKeyUpdateSpy = spyOn(service, 'arrowKeyUpdate');
        service.handleKeyDown(arrowDownEvent);
        jasmine.clock().tick(1000);
        window.clearTimeout(service.delayTimer);
        jasmine.clock().uninstall();
        expect(clearUnderSelectionSpy).toHaveBeenCalled();
        expect(arrowKeyUpdateSpy).toHaveBeenCalled();
    });
    it('51 onMouseUp: on initial push, service should not pop an element from the undo stack', () => {
        service.initialPush = true;
        service.isResizing = false;
        service.mouseDown = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        const popSpy = spyOn(undoRedoSpy['dataUndoArray'], 'pop');
        service.onMouseUp(mouseEventLeft);
        expect(popSpy).not.toHaveBeenCalled();
    });
    it('53 arrowKeyUpdate: when arrowUp is true, should return apply -3 on y coordinates', () => {
        service.arrowUp = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        service.arrowKeyUpdate();
        expect(service.selectorTool.start.y).toEqual(-3);
        expect(service.selectorTool.end.y).toEqual(-2);
    });
    it('53 arrowKeyUpdate: when arrowLeft is true, should return apply -3 on x coordinates', () => {
        service.arrowLeft = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        service.arrowKeyUpdate();
        expect(service.selectorTool.start.x).toEqual(-3);
        expect(service.selectorTool.end.x).toEqual(-2);
    });
    it('54 arrowKeyUpdate: when arrowRight is true, should return apply 3 on x coordinates', () => {
        service.arrowRight = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        service.arrowKeyUpdate();
        expect(service.selectorTool.start.x).toEqual(3);
        expect(service.selectorTool.end.x).toEqual(4);
    });
    it('55 arrowKeyUpdate: when arrowDown is true, should return apply 3 on y coordinates', () => {
        service.arrowDown = true;
        service.selectorTool.start.x = 0;
        service.selectorTool.end.x = 1;
        service.selectorTool.start.y = 0;
        service.selectorTool.end.y = 1;
        service.arrowKeyUpdate();
        expect(service.selectorTool.start.y).toEqual(3);
        expect(service.selectorTool.end.y).toEqual(4);
    });
    it('56 selectAll: should call copyArea and redrawSelectedArea', () => {
        const copyAreaSpy = spyOn(service.selectorTool, 'copyArea');
        service.selectAll();
        expect(service.selectorTool.redrawSelectedArea).toHaveBeenCalled();
        expect(copyAreaSpy).toHaveBeenCalled();
    });
    it('57 handleShortcuts: if event.key is Backspace, should call selectorTool.removePoint', () => {
        const backspace = {
            key: 'Backspace',
            preventDefault() {},
        } as KeyboardEvent;
        const removePointSpy = spyOn(service.selectorTool, 'removePoint');
        service.handleShortcuts(backspace);
        expect(removePointSpy).toHaveBeenCalled();
    });
    it('58 handleShortcuts: should not call updateAfterShift if shift is already pressed', () => {
        const shift = {
            key: 'Shift',
            preventDefault() {},
        } as KeyboardEvent;
        service.mouseDown = true;
        service.selectorTool.isShiftPressed = true;
        const updateAfterShiftSpy = spyOn(service.selectorTool, 'updateAfterShift');
        service.handleShortcuts(shift);
        expect(updateAfterShiftSpy).not.toHaveBeenCalled();
    });
    it('59 pushDataToUndo: if initialPush is true, should not pop from stack', () => {
        drawServiceSpy.initialPush = true;
        const popSpy = spyOn(undoRedoSpy['dataUndoArray'], 'pop');
        service.pushDataToUndo();
        expect(popSpy).not.toHaveBeenCalled();
    });

    it('59 redraw should call clearRect of baseCtx', () => {
        const clearRectSpy = spyOn(service['drawingService'].baseCtx, 'clearRect');
        service.redraw(data);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('60 initTool should call clearForTool', () => {
        const clearForToolSpy = spyOn(service, 'clearForTool');
        service.initTool();
        expect(clearForToolSpy).toHaveBeenCalled();
    });
});
