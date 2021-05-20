import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { PolygonService } from '@app/services/tools/editor-tools/polygon/polygon.service';

@Component({
    selector: 'app-polygon',
    templateUrl: './polygon.component.html',
    styleUrls: ['./polygon.component.scss'],
})
export class PolygonComponent {
    constructor(private editorService: EditorSelectorService, private polygonService: PolygonService) {}

    contours: string[] = ['contour', 'plein', 'pleinAvecC'];
    selectedContour: string = this.contours[0];
    isPolygonSelected: boolean = false;
    valuePolygonSide: number;
    polygonSideSlider: number = Constants.INITIAL_SIDE_POLYGON;
    polygonSizeSlider: number = Constants.POLYGON_FONT_SIZE;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.editorService.changeFontSize(event.value);
        }
    }

    changeSideNumber(event: MatSliderChange): void {
        if (event.value != null) {
            this.polygonService.sideNumber = event.value;
        }
    }

    changeContour(): void {
        this.editorService.changeToolType(this.selectedContour);
    }

    getIsPolygon(): boolean {
        const isPolygon = this.editorService.getCurrentToolName() === 'polygon';
        if (isPolygon) return true;
        this.polygonSizeSlider = Constants.POLYGON_FONT_SIZE;
        this.polygonSideSlider = Constants.INITIAL_SIDE_POLYGON;
        this.selectedContour = 'contour';
        return false;
    }
}
