import { TestBed } from '@angular/core/testing';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { Tool } from './tool';

class ToolStub extends Tool {}

// tslint:disable:no-any
describe('Tool', () => {
    let service: PencilService;
    let toolStub: ToolStub;
    let drawingStub: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        toolStub = new ToolStub({} as DrawingService, new ColorService(new DrawingService()), new UndoRedoService(new DrawingService()));
        toolStub.drawingService = drawingStub = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearContext', 'canvasIsBlank']);

        TestBed.configureTestingModule({
            providers: [
                { provide: PencilService, useValue: toolStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service = TestBed.inject(PencilService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(" should call the tool's mouseDown when receiving a mouseDown event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseDown').and.callThrough();
        service.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's mouseUp when receiving a mouseUp event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseUp').and.callThrough();
        service.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's mouseMove when receiving a mouseMove event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseMove').and.callThrough();
        service.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's mouseOut when receiving a mouseOut event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseOut').and.callThrough();
        service.onMouseOut(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's mouseOver when receiving a mouseOver event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseOver').and.callThrough();
        service.onMouseOver(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's handleKeyDown when receiving a keyBoard event", () => {
        const event = {} as KeyboardEvent;
        const keyEventSpy = spyOn(toolStub, 'handleKeyDown').and.callThrough();
        service.handleKeyDown(event);
        expect(keyEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's handleKeyUp when receiving a keyBoard event", () => {
        const event = {} as KeyboardEvent;
        const keyEventSpy = spyOn(toolStub, 'handleKeyUp').and.callThrough();
        service.handleKeyUp(event);
        expect(keyEventSpy).toHaveBeenCalled();
    });

    it("changeFontSize from PencilService should call tool's changeFontSize", () => {
        const value = 2;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        toolStub.drawingService.baseCtx = baseCtxStub;
        toolStub.drawingService.previewCtx = previewCtxStub;
        const changeSizeSpy = spyOn(toolStub, 'changeFontSize').and.callThrough();
        service.changeFontSize(value);
        expect(changeSizeSpy).toHaveBeenCalled();
    });

    it("initTool should call tool's initTool", () => {
        const initSpy = spyOn(toolStub, 'initTool').and.callThrough();
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;

        toolStub.drawingService.baseCtx = baseCtxStub;
        toolStub.drawingService.previewCtx = previewCtxStub;
        toolStub.drawingService.selectorCtx = selectionCtxStub;
        service.name = 'pencil';
        service.initTool();
        expect(initSpy).toHaveBeenCalled();
        service.name = 'selector';
        service.initTool();
        expect(initSpy).toHaveBeenCalled();
        service.name = 'spray';
        service.initTool();
        expect(initSpy).toHaveBeenCalled();
    });

    it(" should call the tool's onClick when receiving a mouse event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onClick').and.callThrough();
        service.onClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's doubleClick when receiving a mouse event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'doubleClick').and.callThrough();
        service.doubleClick(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's getPositionFromMouse when receiving a mouse event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'getPositionFromMouse').and.callThrough();
        service.getPositionFromMouse(event);
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it(" should call the tool's changeToolTypewhen receiving a string", () => {
        const toolPropriety = '';
        const changeSpy = spyOn(toolStub, 'changeToolType').and.callThrough();
        service.changeToolType(toolPropriety);
        expect(changeSpy).toHaveBeenCalled();
    });

    it(" should call the tool's changeToolTypePropriety when receiving a number", () => {
        const value = 2;
        const changeSpy = spyOn(toolStub, 'changeToolTypePropriety').and.callThrough();
        service.changeToolTypePropriety(value);
        expect(changeSpy).toHaveBeenCalled();
    });
});
