import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';

@Component({
    selector: 'app-rectangle',
    templateUrl: './rectangle.component.html',
    styleUrls: ['./rectangle.component.scss'],
})
export class RectangleComponent {
    constructor(private editorService: EditorSelectorService) {}

    isRectangleSelected: boolean = false;
    contours: string[] = ['contour', 'plein', 'pleinAvecC'];
    selectedContour: string = this.contours[0];
    rectangleSizeSlider: number = Constants.RECTANGLE_FONT_SIZE;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.editorService.changeFontSize(event.value);
        }
    }

    changeContour(): void {
        this.editorService.changeToolType(this.selectedContour);
    }

    getIsRectangle(): boolean {
        const isRectangle = this.editorService.getCurrentToolName() === 'rectangle';
        if (isRectangle) return true;
        this.rectangleSizeSlider = Constants.RECTANGLE_FONT_SIZE;
        this.selectedContour = 'contour';
        return false;
    }
}
