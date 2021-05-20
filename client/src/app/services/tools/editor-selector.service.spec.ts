import { TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EditorSelectorService } from './editor-selector.service';
// tslint:disable:no-any
// tslint:disable:prefer-const
// tslint:disable:no-empty
// tslint:disable:max-file-line-count
// tslint:disable:no-string-literal
describe('EditorSelectorService', () => {
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let service: EditorSelectorService;
    let mouseEvent: MouseEvent;
    let mouseMoveSpy: jasmine.Spy<any>;
    let mouseDownSpy: jasmine.Spy<any>;
    let mouseUpSpy: jasmine.Spy<any>;
    let mouseOverSpy: jasmine.Spy<any>;
    let onClickSpy: jasmine.Spy<any>;
    let doubleClickSpy: jasmine.Spy<any>;
    let handleKeyUpSpy: jasmine.Spy<any>;
    let handleKeyDownSpy: jasmine.Spy<any>;
    let onMouseOutSpy: jasmine.Spy<any>;
    let changeFontSizeSpy: jasmine.Spy<any>;
    let changeToolTypeSpy: jasmine.Spy<any>;
    let changeToolTypeProprietySpy: jasmine.Spy<any>;
    let clipBoardSpy: jasmine.Spy<any>;

    let pressKey: KeyboardEvent;
    let value: any;
    let toolPropriety: any;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'canvasIsBlank']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
            imports: [MaterialModule],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(EditorSelectorService);
        mouseMoveSpy = spyOn<any>(service.currentTool, 'onMouseMove');
        mouseDownSpy = spyOn<any>(service.currentTool, 'onMouseDown');
        mouseUpSpy = spyOn<any>(service.currentTool, 'onMouseUp');
        mouseOverSpy = spyOn<any>(service.currentTool, 'onMouseOver');
        onClickSpy = spyOn<any>(service.currentTool, 'onClick');
        doubleClickSpy = spyOn<any>(service.currentTool, 'doubleClick');
        handleKeyUpSpy = spyOn<any>(service.currentTool, 'handleKeyUp');
        onMouseOutSpy = spyOn<any>(service.currentTool, 'onMouseOut');
        changeFontSizeSpy = spyOn<any>(service.currentTool, 'changeFontSize');
        changeToolTypeSpy = spyOn<any>(service.currentTool, 'changeToolType');
        changeToolTypeProprietySpy = spyOn<any>(service.currentTool, 'changeToolTypePropriety');
        handleKeyDownSpy = spyOn<any>(service.currentTool, 'handleKeyDown');
        clipBoardSpy = spyOn<any>(service['clipBoardService'], 'handleKeyDown');

        service.drawingService.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service.drawingService.previewCtx = previewCtxStub;

        // tslint:disable:no-string-literal
        value = undefined;
        toolPropriety = undefined;
        pressKey = {
            key: '',
        } as KeyboardEvent;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.isSaving = false;
        service.isExporting = false;
        service.isLoading = false;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseMove should call onMouseMove from currentTool', () => {
        service.onMouseMove(mouseEvent);
        expect(mouseMoveSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call onMouseDown from currentTool', () => {
        service.onMouseDown(mouseEvent);
        expect(mouseDownSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call onMouseUp from currentTool', () => {
        service.onMouseUp(mouseEvent);
        expect(mouseUpSpy).toHaveBeenCalled();
    });

    it('onMouseOver should call onMouseOver from currentTool', () => {
        service.onMouseOver(mouseEvent);
        expect(mouseOverSpy).toHaveBeenCalled();
    });

    it('onClick should call onClick from currentTool', () => {
        service.onClick(mouseEvent);
        expect(onClickSpy).toHaveBeenCalled();
    });

    it('onDoubleClick should call onDoubleClick from currentTool', () => {
        service.onDoubleClick(mouseEvent);
        expect(doubleClickSpy).toHaveBeenCalled();
    });

    it('HandleKeyDown should change the currentTool to spray when we press a', () => {
        pressKey = {
            code: 'KeyA',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('spray');
    });

    it('HandleKeyDown should change the currentTool to pencil when we press c', () => {
        pressKey = {
            code: 'KeyC',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('pencil');
    });

    it('HandleKeyDown should change the currentTool to erase when we press e', () => {
        pressKey = {
            code: 'KeyE',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('eraser');
    });

    it('HandleKeyDown should change the currentTool to rectangle when we press 1', () => {
        pressKey = {
            code: 'Digit1',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('rectangle');
    });

    it('HandleKeyDown should change the currentTool to ellipse when we press 2', () => {
        pressKey = {
            code: 'Digit2',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('ellipse');
    });
    it('HandleKeyDown should change the currentTool to selector when we press R', () => {
        pressKey = {
            code: 'KeyR',
        } as KeyboardEvent;
        let initToolSpy = spyOn(service.tools[Constants.SELECTOR_INDEX_TOOLS], 'initTool');
        spyOn(service.tools[Constants.SELECTOR_INDEX_TOOLS], 'handleKeyDown');
        service.handleKeyDown(pressKey);
        expect(initToolSpy).toHaveBeenCalled();
        expect(service.currentTool.name).toBe('selector');
    });

    it('HandleKeyDown should change the currentTool to polygon when we press 3', () => {
        pressKey = {
            code: 'Digit3',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('polygon');
    });

    it('HandleKeyDown should not change saving value if ctrl was not pressed before but s is', () => {
        pressKey = {
            code: 'KeyS',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.isSaving).toBe(false);
    });

    it('if isSaving, prevent other keypress', () => {
        service.isSaving = true;
        const currentTool = service.currentTool;
        pressKey = {
            code: 'KeyC',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool).toEqual(currentTool);
    });
    it('if isExporting, prevent other keypress', () => {
        service.isExporting = true;
        const currentTool = service.currentTool;
        pressKey = {
            code: 'KeyC',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool).toEqual(currentTool);
    });

    it('ctrl o should only set isCreatingNewDrawing to true if canvas is not blank', () => {
        pressKey = {
            code: 'KeyO',
            ctrlKey: false,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(drawServiceSpy.canvasIsBlank).not.toHaveBeenCalled();

        // tslint:disable-next-line: only-arrow-functions
        drawServiceSpy.canvasIsBlank.and.callFake(function (): boolean {
            return true;
        });
        pressKey = {
            code: 'KeyO',
            ctrlKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.isCreatingNewDrawing).toBe(false);

        // tslint:disable-next-line: only-arrow-functions
        drawServiceSpy.canvasIsBlank.and.callFake(function (): boolean {
            return false;
        });
        service.handleKeyDown(pressKey);
        expect(service.isCreatingNewDrawing).toBe(true);
    });

    it('if isCreatingNewDrawing, prevent other keypress', () => {
        service.isCreatingNewDrawing = true;
        const currentTool = service.currentTool;
        pressKey = {
            code: 'KeyC',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool).toEqual(currentTool);
    });

    it('ctrlZ should call undo from undoRedoService', () => {
        pressKey = {
            preventDefault(): void {},
            code: 'KeyZ',
            ctrlKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(undoRedoSpy.undo).toHaveBeenCalled();
    });

    it('ctrlA should select selector tool', () => {
        pressKey = {
            preventDefault(): void {},
            code: 'KeyA',
            ctrlKey: true,
        } as KeyboardEvent;
        const initToolSpy = spyOn(service.tools[Constants.SELECTOR_INDEX_TOOLS], 'initTool');
        const handleKeyDownSpySelector = spyOn(service.tools[Constants.SELECTOR_INDEX_TOOLS], 'handleKeyDown');
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toEqual('selector');
        expect(initToolSpy).toHaveBeenCalled();
        expect(handleKeyDownSpySelector).toHaveBeenCalled();
    });

    it('ctrl+Shift+Z should call undo from undoRedoService', () => {
        pressKey = {
            preventDefault(): void {},
            code: 'KeyZ',
            ctrlKey: true,
            shiftKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(undoRedoSpy.redo).toHaveBeenCalled();
    });

    it('redo should only be called with ctrl+shift+z', () => {
        pressKey = {
            preventDefault(): void {},
            code: 'KeyZ',
            shiftKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(undoRedoSpy.redo).not.toHaveBeenCalled();
    });

    it('HandleKeyDown should change the currentTool to line when we press l', () => {
        pressKey = {
            code: 'KeyL',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('line');
    });

    it('HandleKeyDown should default to currentTool handleKeyDown', () => {
        pressKey = {
            code: 'Digit7',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(handleKeyDownSpy).toHaveBeenCalled();
    });

    it('handleKeyDown should call handleKeyDown from currentTool', () => {
        pressKey = {
            code: 'ShiftLeft',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(handleKeyDownSpy).toHaveBeenCalled();
    });

    it('handleKeyUp should call handleKeyUp from currentTool', () => {
        service.handleKeyUp(pressKey);
        expect(handleKeyUpSpy).toHaveBeenCalled();
    });

    it('onMouseOut should call onMouseOut from currentTool', () => {
        service.onMouseOut(mouseEvent);
        expect(onMouseOutSpy).toHaveBeenCalled();
    });

    it('changeTool should call initTool from the tool in param', () => {
        service.changeTool('eraser');
        let initToolSpy = spyOn(service.tools[Constants.PENCIL_INDEX_TOOLS], 'initTool');
        service.changeTool('pencil');
        expect(initToolSpy).toHaveBeenCalled();
    });

    it('changeTool should change the current tool to tool in param', () => {
        let initToolSpy = spyOn(service.tools[Constants.ERASER_INDEX_TOOLS], 'initTool');
        service.changeTool('eraser');
        expect(service.currentTool.name).toBe('eraser');
        expect(initToolSpy).toHaveBeenCalled();
    });

    it('changeTool should change the current tool to tool in param', () => {
        service.changeTool('eraser');
        let initToolSpy = spyOn(service.tools[Constants.PENCIL_INDEX_TOOLS], 'initTool');
        service.changeTool('pencil');
        expect(service.currentTool.name).toBe('pencil');
        expect(initToolSpy).toHaveBeenCalled();
    });

    it('changeTool should not change the current tool if tool is undefined', () => {
        let tool: any;
        const name: string = service.currentTool.name;
        service.changeTool(tool);
        expect(service.currentTool.name).toBe(name);
    });

    it('changeFontSize should call changeFontSize from currentTool when value is not undefined', () => {
        service.changeFontSize(2);
        expect(changeFontSizeSpy).toHaveBeenCalled();
    });

    it('changeFontSize should not call changeFontSize from currentTool when value is undefined', () => {
        service.changeFontSize(value);
        expect(changeFontSizeSpy).not.toHaveBeenCalled();
    });

    it('changeToolType should call changeToolType from currentTool when value is not undefined', () => {
        service.changeToolType('');
        expect(changeToolTypeSpy).toHaveBeenCalled();
    });

    it('changeToolType should call changeToolType from currentTool when toolPropriety is undefined', () => {
        service.changeToolType(toolPropriety);
        expect(changeToolTypeSpy).not.toHaveBeenCalled();
    });

    it('changeToolTypePropriety should call changeToolTypePropriety from currentTool when value is not undefined', () => {
        service.changeToolTypePropriety(2);
        expect(changeToolTypeProprietySpy).toHaveBeenCalled();
    });

    it('changeToolTypePropriety should not call changeToolTypePropriety from currentTool when value is undefined', () => {
        service.changeToolTypePropriety(value);
        expect(changeToolTypeProprietySpy).not.toHaveBeenCalled();
    });

    it('getCurrentToolName should return the name of the current tool', () => {
        expect(service.currentTool.name).toBe(service.getCurrentToolName());
    });

    it('1. HandleKeyDown should clipboard when handleKeyDown', () => {
        pressKey = {
            code: 'KeyC',
            ctrlKey: true,
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(clipBoardSpy).toHaveBeenCalled();
    });

    it('2. HandleKeyDown should clipboard when handleKeyDown', () => {
        pressKey = {
            code: 'KeyV',
            ctrlKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(clipBoardSpy).toHaveBeenCalled();
    });

    it('3. HandleKeyDown should clipboard when handleKeyDown', () => {
        pressKey = {
            code: 'KeyX',
            ctrlKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(clipBoardSpy).toHaveBeenCalled();
    });

    it('5. HandleKeyDown should not clipboard when handleKeyDown', () => {
        pressKey = {
            code: 'KeyX',
            ctrlKey: false,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(clipBoardSpy).not.toHaveBeenCalled();
    });

    it('4. HandleKeyDown should clipboard when handleKeyDown', () => {
        pressKey = {
            code: 'Delete',
            ctrlKey: true,
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(clipBoardSpy).toHaveBeenCalled();
    });

    it('HandleKeyDown should change the currentTool to stamp when we press d', () => {
        pressKey = {
            code: 'KeyD',
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('stamp');
    });

    it('HandleKeyDown should change the currentTool to freehand when we press v', () => {
        spyOn(service.tools[Constants.SELECTOR_INDEX_TOOLS], 'initTool');
        pressKey = {
            code: 'KeyV',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('selector');
    });

    it('HandleKeyDown should change the currentTool to bucket when we press b', () => {
        spyOn(service.tools[Constants.BUCKET_INDEX_TOOLS], 'initTool');
        pressKey = {
            code: 'KeyB',
            preventDefault(): void {},
        } as KeyboardEvent;
        service.handleKeyDown(pressKey);
        expect(service.currentTool.name).toBe('bucket');
    });
});
