import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';

@Component({
    selector: 'app-pencil',
    templateUrl: './pencil.component.html',
    styleUrls: ['./pencil.component.scss'],
})
export class PencilComponent {
    constructor(private editorService: EditorSelectorService, private pencilService: PencilService) {}
    pencilSizeSlider: number = 1;

    // appelle la methode du meme nom de pencil-toolbar-service
    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.pencilService.changeFontSize(event.value);
        }
    }

    isPencilSelected(): boolean {
        const isPencil = this.editorService.getCurrentToolName() === 'pencil';
        if (isPencil) {
            return true;
        }
        this.pencilSizeSlider = Constants.PENCIL_FONT_SIZE;
        return false;
    }
}
