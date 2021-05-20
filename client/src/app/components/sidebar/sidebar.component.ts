import { Component } from '@angular/core';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { FreeHandSelectorService } from '@app/services/tools/editor-tools/content-selector/freehand-selector/freehand-selector.service';
import { RectangleSelectorService } from '@app/services/tools/editor-tools/content-selector/rectangle-selector/rectangle-selector.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    selectorTools: Selector[];
    isGridSelected: boolean;

    constructor(
        public drawingService: DrawingService,
        private editorSelectorService: EditorSelectorService,
        private contentSelectorService: ContentSelectorService,
        protected rectangleSelectorService: RectangleSelectorService,
        protected freeHandSelectorService: FreeHandSelectorService,
    ) {
        this.selectorTools = [rectangleSelectorService, freeHandSelectorService];
    }

    selectTool(toolName: string): void {
        this.isGridSelected = false;
        this.editorSelectorService.changeTool(toolName);
        if (toolName === 'selector') {
            this.contentSelectorService.selectorTool = this.selectorTools[0];
        }
    }

    isToolSelected(tool: string): boolean {
        return this.editorSelectorService.getCurrentToolName() === tool;
    }

    switchGrid(): void {
        this.isGridSelected = !this.isGridSelected;
    }
}
