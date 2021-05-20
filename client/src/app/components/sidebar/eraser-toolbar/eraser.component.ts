import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { EraserService } from '@app/services/tools/editor-tools/eraser/eraser-service.service';

@Component({
    selector: 'app-eraser',
    templateUrl: './eraser.component.html',
    styleUrls: ['./eraser.component.scss'],
})
export class EraserComponent {
    constructor(private editorService: EditorSelectorService, private eraserService: EraserService) {}
    eraserSizeSlider: number = Constants.ERASER_FONT_SIZE;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.eraserService.changeFontSize(event.value);
        }
    }

    isEraserSelected(): boolean {
        const isEraser = this.editorService.getCurrentToolName() === 'eraser';
        if (isEraser) {
            return true;
        }
        this.eraserSizeSlider = Constants.ERASER_FONT_SIZE;
        return false;
    }
}
