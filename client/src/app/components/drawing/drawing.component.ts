import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Data } from '@app/classes/data';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { GalleryWindowComponent } from '@app/components/windows/gallery/gallery-window/gallery-window.component';
import { SaveDrawingComponent } from '@app/components/windows/save/save-drawing.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;
export const MIN_WIDTH = 250;
export const MIN_HEIGHT = 250;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('selectorCanvas', { static: false }) selectorCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previousCanvas', { static: false }) previousCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private selectorCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private previousCtx: CanvasRenderingContext2D;
    canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    resizingX: boolean;
    resizingY: boolean;
    mouseOverResizePts: boolean;

    currentTool: Tool;
    timer: number;
    preventClick: boolean;

    constructor(
        public drawingService: DrawingService,
        private editorService: EditorSelectorService,
        private undoRedoService: UndoRedoService,
        private dialog: MatDialog,
        public gridService: GridService,
        private autoSaveService: AutoSaveService,
    ) {
        this.currentTool = editorService.currentTool;
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.resizingX = false;
        this.resizingY = false;
        this.mouseOverResizePts = false;
        this.timer = 0;
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.selectorCtx = this.selectorCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previousCtx = this.previousCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.selectorCtx = this.selectorCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.previousCtx = this.previousCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;

        this.gridCtx.canvas.width = this.drawingService.baseCtx.canvas.width;
        this.gridCtx.canvas.height = this.drawingService.baseCtx.canvas.height;

        this.dialog.afterAllClosed.subscribe((res) => {
            this.editorService.isLoading = false;
            this.editorService.isSaving = false;
            this.editorService.isExporting = false;
        });
    }
    isResizingX(): void {
        this.resizingX = true;
        this.drawingService.isDrawing = true;
    }
    isResizingY(): void {
        this.resizingY = true;
        this.drawingService.isDrawing = true;
    }

    onMouseMove(event: MouseEvent): void {
        event.preventDefault();
        if (!this.resizingX && !this.resizingY && !this.mouseOverResizePts) {
            this.editorService.onMouseMove(event);
        }
    }
    @HostListener('window:mousemove', ['$event'])
    onMouseMoveWindow(event: MouseEvent): void {
        event.preventDefault();
        if (this.resizingX || this.resizingY) {
            if (this.resizingX && event.clientX - this.baseCanvas.nativeElement.getBoundingClientRect().left >= MIN_WIDTH)
                this.drawingService.previewWidth = event.clientX - this.baseCanvas.nativeElement.getBoundingClientRect().left;
            if (this.resizingY && event.clientY >= MIN_HEIGHT) this.drawingService.previewHeight = event.clientY;
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        if (!this.resizingX && !this.resizingY) this.editorService.onMouseDown(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!this.resizingX && !this.resizingY && !this.mouseOverResizePts) {
            this.editorService.onMouseUp(event);
        } else {
            this.drawingService.isDrawing = false;

            const data: Data = new Data();
            data.path.push({ x: this.drawingService.width, y: this.drawingService.height } as Vec2);
            this.undoRedoService.dataRedoArray = [];
            data.name = 'resize';
            this.undoRedoService.pushToArray(data as Data);

            const img = new Image();
            img.src = this.drawingService.canvas.toDataURL('image/png');
            const oldWidth = this.drawingService.baseCtx.lineWidth;
            this.drawingService.width = this.drawingService.previewWidth;
            this.drawingService.height = this.drawingService.previewHeight;

            setTimeout(() => {
                this.baseCtx.drawImage(img, 0, 0);
                this.gridService.applyGrid();
                // this.editorService.changeTool(this.editorService.currentTool);
                // if (this.editorService.currentTool.name !== 'selector') this.editorService.changeTool(this.editorService.currentTool.name);
                this.baseCtx.lineWidth = oldWidth;
                this.previewCtx.lineWidth = oldWidth;
                this.autoSaveService.saveImage(this.drawingService.baseCtx.canvas.toDataURL());
            }, 0);
        }
        this.resizingX = false;
        this.resizingY = false;
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.editorService.onMouseOut(event);
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.editorService.onMouseOver(event);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            this.ctrlHandler(event);
        } else {
            this.editorService.handleKeyDown(event);
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this.editorService.handleKeyUp(event);
    }
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this.timer = 0;
        this.preventClick = false;
        const delay = 60;
        this.timer = window.setTimeout(() => {
            if (!this.preventClick) {
                this.editorService.onClick(event);
            }
        }, delay);
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent): void {
        this.preventClick = true;
        clearTimeout(this.timer);
        this.editorService.onDoubleClick(event);
    }
    getIsUsingSelectionTool(): boolean {
        return this.editorService.getCurrentToolName() === 'selector';
    }

    ctrlHandler(event: KeyboardEvent): void {
        event.preventDefault();
        if (!(this.editorService.isSaving || this.editorService.isLoading || this.editorService.isExporting)) {
            switch (event.code) {
                case 'KeyG':
                    this.dialog.open(GalleryWindowComponent);
                    this.editorService.isLoading = true;
                    break;
                case 'KeyS':
                    this.dialog.open(SaveDrawingComponent, {
                        height: '75%',
                        width: '60%',
                    });
                    this.editorService.isSaving = true;
                    break;
                case 'KeyE':
                    this.editorService.isExporting = true;
                    break;
                default:
                    this.editorService.handleKeyDown(event);
                    break;
            }
        }
    }
}
