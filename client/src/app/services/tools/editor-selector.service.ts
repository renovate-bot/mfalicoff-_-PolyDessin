import { Injectable } from '@angular/core';
import { Selector } from '@app/classes/selector';
import { Tool } from '@app/classes/tool';
import { Constants } from '@app/global/constants';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/editor-tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/editor-tools/eraser/eraser-service.service';
import { LineService } from '@app/services/tools/editor-tools/line/line.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { PolygonService } from '@app/services/tools/editor-tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/editor-tools/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/editor-tools/spray/spray.service';
import { StampService } from '@app/services/tools/editor-tools/stamp/stamp.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BucketService } from './editor-tools/bucket-paint/bucket.service';
import { ContentSelectorService } from './editor-tools/content-selector/content-selector.service';
import { FreeHandSelectorService } from './editor-tools/content-selector/freehand-selector/freehand-selector.service';
import { RectangleSelectorService } from './editor-tools/content-selector/rectangle-selector/rectangle-selector.service';

@Injectable({
    providedIn: 'root',
})
export class EditorSelectorService {
    tools: Tool[];
    selectorTools: Selector[];
    currentTool: Tool;
    isSaving: boolean = false;
    isExporting: boolean = false;
    isCreatingNewDrawing: boolean = false;
    isLoading: boolean = false;

    constructor(
        protected pencilService: PencilService,
        protected rectangleService: RectangleService,
        protected ellipseService: EllipseService,
        protected eraserService: EraserService,
        protected lineService: LineService,
        protected colorService: ColorService,
        protected selector: ContentSelectorService,
        public drawingService: DrawingService,
        protected undoRedoService: UndoRedoService,
        protected polygonService: PolygonService,
        protected sprayService: SprayService,
        protected stampService: StampService,
        protected bucketService: BucketService,
        protected rectangleSelectorService: RectangleSelectorService,
        protected freeHandSelectorService: FreeHandSelectorService,
        protected clipBoardService: ClipboardService,
    ) {
        this.tools = [
            pencilService,
            rectangleService,
            ellipseService,
            eraserService,
            lineService,
            polygonService,
            sprayService,
            selector,
            stampService,
            bucketService,
        ];
        this.selectorTools = [rectangleSelectorService, freeHandSelectorService];
        this.currentTool = this.tools[Constants.PENCIL_INDEX_TOOLS];
    }

    onMouseMove(event: MouseEvent): void {
        this.currentTool.onMouseMove(event);
    }

    onMouseDown(event: MouseEvent): void {
        this.currentTool.onMouseDown(event);
    }

    onMouseUp(event: MouseEvent): void {
        this.currentTool.onMouseUp(event);
    }

    onMouseOver(event: MouseEvent): void {
        this.currentTool.onMouseOver(event);
    }

    onClick(event: MouseEvent): void {
        this.currentTool.onClick(event);
    }

    onDoubleClick(event: MouseEvent): void {
        this.currentTool.doubleClick(event);
    }

    handleKeyDown(event: KeyboardEvent): void {
        this.currentTool.drawingService.selectionIsActive = false;
        if (!this.isSaving && !this.isExporting && !this.isLoading) {
            const currentCodeIsKey = event.code.includes('Key');
            switch (currentCodeIsKey) {
                case true:
                    this.keyHandler(event);
                    break;
                case false:
                    this.otherKeyHandler(event);
                    break;
            }
        }
    }

    keyHandler(event: KeyboardEvent): void {
        const keyCases = ['KeyA', 'KeyC', 'KeyD', 'KeyE', 'KeyR', 'KeyZ'];
        const isInArray = keyCases.indexOf(event.code) !== Constants.ITEM_NOT_FOUND;

        switch (isInArray) {
            case true:
                this.keyCasesHandler(event);
                break;
            case false:
                this.otherKeyCasesHandler(event);
                break;
        }
    }

    otherKeyHandler(event: KeyboardEvent): void {
        switch (event.code) {
            case 'Digit1':
                this.currentTool = this.tools[Constants.RECTANGLE_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            case 'Digit2':
                this.currentTool = this.tools[Constants.ELLIPSE_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            case 'Digit3':
                this.currentTool = this.tools[Constants.POLYGON_INDEX_TOOLS];
                break;
            case 'ShiftLeft':
                this.currentTool.handleKeyDown(event);
                break;
            case 'Delete':
                this.clipBoardService.handleKeyDown(event);
                break;
            default:
                this.currentTool.handleKeyDown(event);
        }
    }

    keyCasesHandler(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyA':
                if (!event.ctrlKey) this.currentTool = this.tools[Constants.SPRAY_INDEX_TOOLS];
                else {
                    this.currentTool = this.tools[Constants.SELECTOR_INDEX_TOOLS];
                    this.currentTool.initTool();
                    this.currentTool.handleKeyDown(event);
                }
                break;
            case 'KeyC':
                if (!event.ctrlKey) {
                    this.currentTool = this.tools[Constants.PENCIL_INDEX_TOOLS];
                    this.currentTool.initTool();
                } else {
                    this.clipBoardService.handleKeyDown(event);
                }
                break;
            case 'KeyD':
                this.currentTool = this.tools[Constants.STAMP_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            case 'KeyE':
                this.currentTool = this.tools[Constants.ERASER_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            case 'KeyR':
                this.currentTool = this.tools[Constants.SELECTOR_INDEX_TOOLS];
                this.selector.selectorTool = this.selectorTools[0];
                this.currentTool.initTool();
                break;
            case 'KeyZ':
                if (event.ctrlKey && !event.shiftKey) {
                    event.preventDefault();
                    this.undoRedoService.undo();
                } else if (event.ctrlKey && event.shiftKey) {
                    event.preventDefault();
                    this.undoRedoService.redo();
                }
                break;
        }
    }

    otherKeyCasesHandler(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyL':
                this.currentTool = this.tools[Constants.LINE_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            case 'KeyO':
                if (event.ctrlKey) {
                    event.preventDefault();
                    if (!this.drawingService.canvasIsBlank()) this.isCreatingNewDrawing = true;
                }
                break;
            case 'KeyV':
                event.preventDefault();
                if (!event.ctrlKey) {
                    this.currentTool = this.tools[Constants.SELECTOR_INDEX_TOOLS];
                    this.currentTool.initTool();
                    this.selector.selectorTool = this.selectorTools[1];
                } else {
                    this.clipBoardService.handleKeyDown(event);
                }
                break;
            case 'KeyX':
                if (event.ctrlKey) this.clipBoardService.handleKeyDown(event);
                break;
            case 'KeyB':
                this.currentTool = this.tools[Constants.BUCKET_INDEX_TOOLS];
                this.currentTool.initTool();
                break;
            default:
                this.currentTool.handleKeyDown(event);
                break;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        this.currentTool.handleKeyUp(event);
    }

    onMouseOut(event: MouseEvent): void {
        this.currentTool.onMouseOut(event);
    }

    changeTool(toolName: string): void {
        this.currentTool.drawingService.selectionIsActive = false;
        const toolFind: Tool | undefined = this.tools.find((t) => {
            if (toolName !== undefined) {
                return t.name === toolName;
            }
            return false;
        });
        if (toolFind != undefined && toolFind !== this.currentTool) {
            this.currentTool = toolFind;
            this.currentTool.initTool();
        }
    }

    changeFontSize(value: number): void {
        if (typeof value !== 'undefined') {
            this.currentTool.changeFontSize(value);
        }
    }

    changeToolType(toolPropriety: string): void {
        if (typeof toolPropriety !== 'undefined') {
            this.currentTool.changeToolType(toolPropriety);
        }
    }

    changeToolTypePropriety(value: number): void {
        if (typeof value !== 'undefined') {
            this.currentTool.changeToolTypePropriety(value);
        }
    }

    getCurrentToolName(): string {
        return this.currentTool.name;
    }
}
