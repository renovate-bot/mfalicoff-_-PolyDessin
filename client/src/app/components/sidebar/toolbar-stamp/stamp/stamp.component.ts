import { Component, HostListener } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Constants } from '@app/global/constants';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { StampService } from '@app/services/tools/editor-tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp',
    templateUrl: './stamp.component.html',
    styleUrls: ['./stamp.component.scss'],
})
export class StampComponent {
    isStampSelected: boolean = false;
    stampSizeSlider: number;
    stampAngleSlider: number;

    constructor(private editorService: EditorSelectorService, public stampService: StampService) {}

    changeStampSize(event: MatSliderChange): void {
        if (event.value != null) {
            this.stampService.stampSize = event.value * Constants.STAMP_SCALE;
        }
    }

    changeRotationAngle(event: MatSliderChange): void {
        if (event.value != null) {
            this.stampService.sliderAngleValue = event.value;
        }
    }

    @HostListener('window:wheel', ['$event'])
    wheelEvent(event: WheelEvent): void {
        this.stampService.rotateImg(event);
    }

    getIsStamp(): boolean {
        const isStamp = this.editorService.getCurrentToolName() === 'stamp';
        if (isStamp) return true;
        this.stampSizeSlider = 1;
        this.stampService.stampSize = 1 * Constants.STAMP_SCALE;
        return false;
    }

    selectedStamp(stamp: string): boolean {
        return this.stampService.imgName === stamp;
    }
}
