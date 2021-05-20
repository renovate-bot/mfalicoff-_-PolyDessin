import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '@app/angular-material';
import { ColorOpacityComponent } from '@app/components/color/color-opacity/color-opacity.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorSliderComponent } from '@app/components/color/color-slider/color-slider.component';
import { ColorComponent } from '@app/components/color/color.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { GridComponent } from '@app/components/drawing/grid/grid.component';
import { BucketToolbarComponent } from '@app/components/sidebar/bucket-toolbar/bucket-toolbar.component';
import { ClipboardComponent } from '@app/components/sidebar/clipboard/clipboard.component';
import { ContentSelectorComponent } from '@app/components/sidebar/content-selector/content-selector.component';
import { EllipseToolbarComponent } from '@app/components/sidebar/ellipse-toolbar/ellipse-toolbar.component';
import { EraserComponent } from '@app/components/sidebar/eraser-toolbar/eraser.component';
import { LineComponent } from '@app/components/sidebar/line-component/line.component';
import { PencilComponent } from '@app/components/sidebar/pencil-toolbar/pencil.component';
import { PolygonComponent } from '@app/components/sidebar/polygon-toolbar/polygon/polygon.component';
import { RectangleComponent } from '@app/components/sidebar/rectangle-toolbar/rectangle.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SprayComponent } from '@app/components/sidebar/spray/spray-toolbar/spray.component';
import { StampComponent } from '@app/components/sidebar/toolbar-stamp/stamp/stamp.component';
import { UndoRedoComponent } from '@app/components/sidebar/undo-redo/undo-redo/undo-redo.component';
import { WindowButtonsComponent } from '@app/components/sidebar/window-buttons/window-buttons.component';
import { SaveMenuComponent } from '@app/components/windows/create/save-menu.component';
import { ExportWindowComponent } from '@app/components/windows/export/export-window.component';
import { SaveDrawingComponent } from '@app/components/windows/save/save-drawing.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let autoSaveServiceStub: jasmine.SpyObj<AutoSaveService>;

    beforeEach(async(() => {
        autoSaveServiceStub = jasmine.createSpyObj('AutoSaveService', ['loadImage']);

        TestBed.configureTestingModule({
            declarations: [
                EditorComponent,
                DrawingComponent,
                SidebarComponent,
                EraserComponent,
                PencilComponent,
                RectangleComponent,
                LineComponent,
                SaveMenuComponent,
                EllipseToolbarComponent,
                ColorComponent,
                ColorOpacityComponent,
                ColorPaletteComponent,
                ColorPaletteComponent,
                ColorSliderComponent,
                SaveDrawingComponent,
                ExportWindowComponent,
                ContentSelectorComponent,
                UndoRedoComponent,
                PolygonComponent,
                SprayComponent,
                GridComponent,
                BucketToolbarComponent,
                ClipboardComponent,
                WindowButtonsComponent,
                StampComponent,
            ],
            imports: [MaterialModule, HttpClientTestingModule],
        }).compileComponents();

        autoSaveServiceStub = TestBed.inject(AutoSaveService) as jasmine.SpyObj<AutoSaveService>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('1. should create', () => {
        expect(component).toBeTruthy();
    });

    it('2. should not call loadImage if it doesnt exist', () => {
        spyOn(autoSaveServiceStub, 'isImageStored').and.returnValue(false);
        const loadImageSpy = spyOn(autoSaveServiceStub, 'loadImage');
        component.ngOnInit();
        expect(loadImageSpy).not.toHaveBeenCalled();
    });

    it('3. should call loadImage if it exists', () => {
        spyOn(autoSaveServiceStub, 'isImageStored').and.returnValue(true);
        const loadImageSpy = spyOn(autoSaveServiceStub, 'loadImage');
        component.ngOnInit();
        expect(loadImageSpy).toHaveBeenCalled();
    });
});
