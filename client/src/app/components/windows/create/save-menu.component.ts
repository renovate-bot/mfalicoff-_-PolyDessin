import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveDrawingComponent } from '@app/components/windows/save/save-drawing.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-save-menu',
    templateUrl: './save-menu.component.html',
    styleUrls: ['./save-menu.component.scss'],
})
export class SaveMenuComponent {
    constructor(
        public editorService: EditorSelectorService,
        public drawingService: DrawingService,
        public dialog: MatDialog,
        private undoRedoService: UndoRedoService,
        private autoSaveService: AutoSaveService,
        private clipboardService: ClipboardService,
    ) {}

    getIsNewDrawing(): boolean {
        return this.editorService.isCreatingNewDrawing;
    }

    hideWindow(): void {
        this.editorService.isCreatingNewDrawing = false;
        this.dialog.closeAll();
    }
    saveDrawing(): void {
        this.hideWindow();
        this.editorService.isSaving = true;
        this.dialog.open(SaveDrawingComponent, {
            height: '75%',
            width: '60%',
        });
    }
    discardDrawing(): void {
        this.drawingService.selectionIsActive = false;
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.drawingService.clearContext();
        this.autoSaveService.clearImage();
        this.undoRedoService.imageFromGallery = null;
        this.undoRedoService.resetArrays();
        this.clipboardService.reset();
        this.hideWindow();
    }
}
