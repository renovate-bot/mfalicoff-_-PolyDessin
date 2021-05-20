import { Component } from '@angular/core';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Component({
    selector: 'app-undo-redo',
    templateUrl: './undo-redo.component.html',
    styleUrls: ['./undo-redo.component.scss'],
})
export class UndoRedoComponent {
    constructor(private undoRedoService: UndoRedoService) {}

    undo(): void {
        this.undoRedoService.undo();
    }

    redo(): void {
        this.undoRedoService.redo();
    }

    enableUndo(): boolean {
        return this.undoRedoService.getLengthUndo() >= 1;
    }

    enableRedo(): boolean {
        return this.undoRedoService.dataRedoArray.length >= 1;
    }
}
