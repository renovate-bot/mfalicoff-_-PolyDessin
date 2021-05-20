import { Component, OnInit } from '@angular/core';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
    constructor(private autoSaveService: AutoSaveService) {}

    ngOnInit(): void {
        if (this.autoSaveService.isImageStored()) this.autoSaveService.loadImage();
    }
}
