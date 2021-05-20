import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ContentSelectorComponent } from './content-selector.component';
let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;
let contentSelectorSpy: ContentSelectorService;

describe('ContentSelectorComponent', () => {
    let component: ContentSelectorComponent;
    let fixture: ComponentFixture<ContentSelectorComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName', 'changeFontSize', 'changeToolType']);
        contentSelectorSpy = new ContentSelectorService(
            drawingServiceSpy,
            new ColorService(drawingServiceSpy),
            new UndoRedoService(drawingServiceSpy),
        );
        TestBed.configureTestingModule({
            declarations: [ContentSelectorComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: ContentSelectorService, useValue: contentSelectorSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContentSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('1 getIsRectangleSelector: should return true if selector name is rectangle', () => {
        contentSelectorSpy.selectorTool.name = 'rectangle';
        expect(component.getIsRectangleSelector()).toBeTrue();
        contentSelectorSpy.selectorTool.name = 'freehand';
        expect(component.getIsRectangleSelector()).toBeFalse();
    });
    it('2 getIsFreeHandSelector: should return true if selector name is freehand', () => {
        contentSelectorSpy.selectorTool.name = 'freehand';
        expect(component.getIsFreeHandSelector()).toBeTrue();
        contentSelectorSpy.selectorTool.name = 'rectangle';
        expect(component.getIsFreeHandSelector()).toBeFalse();
    });
    it('3 getIsSelector: should return false if selector name is not selector', () => {
        editorServiceSpy.currentTool = new PencilService(
            drawingServiceSpy,
            new ColorService(drawingServiceSpy),
            new UndoRedoService(drawingServiceSpy),
        );
        editorServiceSpy.currentTool.name = 'not-selector';
        expect(component.getIsSelector()).toBeFalse();
    });

    it('4 selectAll: should call selectSelectorRectangle and selectAll', () => {
        const selectSelectorRectangleSpy = spyOn(component, 'selectSelectorRectangle');
        const selectAllSpy = spyOn(contentSelectorSpy, 'selectAll');
        component.selectAll();
        expect(selectSelectorRectangleSpy).toHaveBeenCalled();
        expect(selectAllSpy).toHaveBeenCalled();
    });
    it('5 selectSelectorRectangle: should call changeTool and update selectorTool', () => {
        component.selectSelectorRectangle();
        expect(editorServiceSpy.changeTool).toHaveBeenCalled();
        expect(contentSelectorSpy.selectorTool).toEqual(component.selectorTools[0]);
    });
    it('6 selectSelectorFreeHand: should call changeTool and update selectorTool', () => {
        component.selectSelectorFreeHand();
        expect(editorServiceSpy.changeTool).toHaveBeenCalled();
        expect(contentSelectorSpy.selectorTool).toEqual(component.selectorTools[1]);
    });
});
