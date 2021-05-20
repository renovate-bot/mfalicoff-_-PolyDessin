import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';

@Component({
    selector: 'app-ellipse-toolbar',
    templateUrl: './ellipse-toolbar.component.html',
    styleUrls: ['./ellipse-toolbar.component.scss'],
})
export class EllipseToolbarComponent {
    constructor(private editorService: EditorSelectorService) {}

    contours: string[] = ['contour', 'plein', 'pleinAvecC'];
    selectedContour: string = this.contours[0];
    isEllipseSelected: boolean = false;
    ellipseSizeSlider: number = 1;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.editorService.changeFontSize(event.value);
        }
    }

    changeContour(): void {
        this.editorService.changeToolType(this.selectedContour);
    }

    getIsEllipseSelected(): boolean {
        const isEllipse = this.editorService.getCurrentToolName() === 'ellipse';
        if (isEllipse) return true;
        this.ellipseSizeSlider = Constants.ELLIPSE_FONT_SIZE;
        this.selectedContour = 'contour';
        return false;
    }
}
