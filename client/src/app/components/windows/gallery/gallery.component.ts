import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GalleryWindowComponent } from '@app/components/windows/gallery/gallery-window/gallery-window.component';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent {
    @Input()
    isInMenu: boolean = false;

    constructor(private dialog: MatDialog, private editorService: EditorSelectorService) {}

    openGalleryWindow(): void {
        this.dialog.open(GalleryWindowComponent, {
            height: '75%',
            width: '75%',
        });
        this.editorService.isLoading = true;
    }
}
