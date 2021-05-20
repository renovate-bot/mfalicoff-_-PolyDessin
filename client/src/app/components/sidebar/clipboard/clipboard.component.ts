import { Component } from '@angular/core';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-clipboard',
    templateUrl: './clipboard.component.html',
    styleUrls: ['./clipboard.component.scss'],
})
export class ClipboardComponent {
    constructor(private clipboardService: ClipboardService, private drawingService: DrawingService) {}

    isSelectorActive(): boolean {
        return this.drawingService.areaIsSelected;
    }

    isClipBoardActive(): boolean {
        return this.clipboardService.isImageInClipboard();
    }

    copy(): void {
        this.clipboardService.copy();
    }

    paste(): void {
        this.clipboardService.paste();
    }

    cut(): void {
        this.clipboardService.cut();
    }

    delete(): void {
        this.clipboardService.delete();
    }
}
