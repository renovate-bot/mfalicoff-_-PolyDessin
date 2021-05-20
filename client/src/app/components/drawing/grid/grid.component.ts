import { Component, HostListener, Input } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    constructor(public gridService: GridService) {}

    gridOpacitySlider: number = 5;
    gridDimensionSlider: number = 20;
    @Input() gridIsSelected: boolean;

    changeGridOpacity(event: MatSliderChange): void {
        if (event.value != null) {
            this.gridService.gridOpacity = event.value / Constants.OPACITY_DECIMAL;
            this.gridService.applyGrid();
        }
    }

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        this.gridService.handleKey(event);
        this.gridService.changeSquareDimension(event);
    }

    changeDimensionSlider(event: MatSliderChange): void {
        if (event.value != null) {
            this.gridService.squareDimension = event.value;
            this.gridService.applyGrid();
        }
    }
}
