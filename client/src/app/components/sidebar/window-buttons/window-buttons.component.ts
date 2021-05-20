import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveMenuComponent } from '@app/components/windows/create/save-menu.component';
import { GalleryWindowComponent } from '@app/components/windows/gallery/gallery-window/gallery-window.component';
import { SaveDrawingComponent } from '@app/components/windows/save/save-drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';

@Component({
    selector: 'app-window-buttons',
    templateUrl: './window-buttons.component.html',
    styleUrls: ['./window-buttons.component.scss'],
})
export class WindowButtonsComponent {
    constructor(private editorService: EditorSelectorService, private drawingService: DrawingService, private dialog: MatDialog) {}

    openSaveMenu(): void {
        this.dialog.open(SaveDrawingComponent, {
            height: '75%',
            width: '60%',
        });
        this.editorService.isSaving = true;
    }

    openExportMenu(): void {
        this.editorService.isExporting = true;
    }

    openGalleryMenu(): void {
        this.dialog.open(GalleryWindowComponent);
        this.editorService.isLoading = true;
    }

    isWindowOpen(): boolean {
        return this.editorService.isSaving || this.editorService.isLoading || this.editorService.isExporting;
    }
    createNewDrawing(): void {
        this.editorService.isCreatingNewDrawing = !this.drawingService.canvasIsBlank();
        if (this.editorService.isCreatingNewDrawing) {
            this.editorService.isLoading = true;
            this.dialog.open(SaveMenuComponent, {
                height: '20%',
                width: '50%',
            });
        }
    }
}
