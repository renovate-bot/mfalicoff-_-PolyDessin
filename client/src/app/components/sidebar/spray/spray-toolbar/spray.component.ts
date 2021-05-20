import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { SprayService } from '@app/services/tools/editor-tools/spray/spray.service';

@Component({
    selector: 'app-spray',
    templateUrl: './spray.component.html',
    styleUrls: ['./spray.component.scss'],
})
export class SprayComponent {
    constructor(private editorService: EditorSelectorService, private sprayService: SprayService) {}

    isSpraySelected: boolean = false;
    spraySizeSlider: number = Constants.INITIAL_SPRAY_SIZE;
    dropletSizeSlider: number = 1;
    emissionSpeedSlider: number = Constants.INITAIL_SPRAY_EMISSON;

    changeFontSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.sprayService.spraySize = event.value;
        }
    }

    changeDropletSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.sprayService.dropletSize = event.value;
        }
    }

    changeEmissionSpeed(event: MatSliderChange): void {
        if (event.value != null) {
            this.sprayService.emissionSpeed = event.value;
        }
    }

    getIsSpray(): boolean {
        const isSpray = this.editorService.getCurrentToolName() === 'spray';
        if (isSpray) return true;
        this.spraySizeSlider = Constants.INITIAL_SPRAY_SIZE;
        this.sprayService.spraySize = Constants.INITIAL_SPRAY_SIZE;

        this.dropletSizeSlider = 1;
        this.sprayService.dropletSize = 1;

        this.emissionSpeedSlider = Constants.INITAIL_SPRAY_EMISSON;
        this.sprayService.emissionSpeed = Constants.INITAIL_SPRAY_EMISSON;

        return false;
    }
}
