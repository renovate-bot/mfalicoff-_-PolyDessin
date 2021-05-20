import { Component } from '@angular/core';
import { Selector } from '@app/classes/selector';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { FreeHandSelectorService } from '@app/services/tools/editor-tools/content-selector/freehand-selector/freehand-selector.service';
import { RectangleSelectorService } from '@app/services/tools/editor-tools/content-selector/rectangle-selector/rectangle-selector.service';

@Component({
    selector: 'app-content-selector',
    templateUrl: './content-selector.component.html',
    styleUrls: ['./content-selector.component.scss'],
})
export class ContentSelectorComponent {
    selectorTools: Selector[];
    constructor(
        private editorService: EditorSelectorService,
        private contentSelectorService: ContentSelectorService,
        protected rectangleSelectorService: RectangleSelectorService,
        protected freeHandSelectorService: FreeHandSelectorService,
    ) {
        this.selectorTools = [rectangleSelectorService, freeHandSelectorService];
    }

    isSelectorSelected: boolean = false;

    selectSelectorRectangle(): void {
        this.isSelectorSelected = true;
        this.editorService.changeTool('selector');
        this.contentSelectorService.selectorTool = this.selectorTools[0];
    }
    selectSelectorFreeHand(): void {
        this.isSelectorSelected = true;
        this.editorService.changeTool('selector');
        this.contentSelectorService.selectorTool = this.selectorTools[1];
    }

    getIsSelector(): boolean {
        return this.editorService.getCurrentToolName() === 'selector';
    }
    getIsRectangleSelector(): boolean {
        return this.contentSelectorService.selectorTool.name === 'rectangle';
    }
    getIsFreeHandSelector(): boolean {
        return this.contentSelectorService.selectorTool.name === 'freehand';
    }
    selectAll(): void {
        this.selectSelectorRectangle();
        this.contentSelectorService.selectAll();
    }
}
