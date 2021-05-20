import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';

@Component({
    selector: 'app-line-component',
    templateUrl: './line.component.html',
    styleUrls: ['./line.component.scss'],
})
export class LineComponent {
    constructor(private editorService: EditorSelectorService) {}

    junctions: string[] = ['sans', 'avec'];
    selectedJunction: string = this.junctions[0];
    isLineSelectedValue: boolean = false;
    lineSizeSlider: number = Constants.LINE_FONT_SIZE;
    currentDiameterSize: number = Constants.LINE_FONT_SIZE;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.editorService.changeFontSize(event.value);
        }
    }

    changeJunction(): void {
        this.editorService.changeToolType(this.selectedJunction);
        return;
    }

    changeDiameter(event: MatSliderChange): void {
        this.editorService.changeToolTypePropriety(event.value as number);
        return;
    }

    isLineSelected(): boolean {
        const isLine = this.editorService.getCurrentToolName() === 'line';
        if (isLine) {
            return true;
        }
        this.lineSizeSlider = Constants.LINE_FONT_SIZE;
        this.currentDiameterSize = Constants.LINE_FONT_SIZE;
        this.selectedJunction = 'sans';
        return false;
    }
}
