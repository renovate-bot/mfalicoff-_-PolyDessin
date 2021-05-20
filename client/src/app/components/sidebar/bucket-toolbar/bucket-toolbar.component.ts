import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { BucketService } from '@app/services/tools/editor-tools/bucket-paint/bucket.service';

@Component({
    selector: 'app-bucket-toolbar',
    templateUrl: './bucket-toolbar.component.html',
    styleUrls: ['./bucket-toolbar.component.scss'],
})
export class BucketToolbarComponent {
    constructor(private editorService: EditorSelectorService, private bucketService: BucketService) {}
    bucketSizeSlider: number = 1;

    changeColorTolerance(event: MatSliderChange): void {
        if (event.value != null) {
            this.bucketService.changeColorTolerance(event.value);
        }
    }

    isBucketSelected(): boolean {
        const isBucket = this.editorService.getCurrentToolName() === 'bucket';
        if (isBucket) return true;
        this.bucketSizeSlider = 1;
        return false;
    }
}
