import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@app/angular-material';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { ContentSelectorService } from '@app/services/tools/editor-tools/content-selector/content-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { ColorOpacityComponent } from './components/color/color-opacity/color-opacity.component';
import { ColorPaletteComponent } from './components/color/color-palette/color-palette.component';
import { ColorSliderComponent } from './components/color/color-slider/color-slider.component';
import { ColorComponent } from './components/color/color.component';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { ContentSelectorResizeComponent } from './components/drawing/content-selector-preview/content-selector-preview.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { GridComponent } from './components/drawing/grid/grid.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { BucketToolbarComponent } from './components/sidebar/bucket-toolbar/bucket-toolbar.component';
import { ClipboardComponent } from './components/sidebar/clipboard/clipboard.component';
import { ContentSelectorComponent } from './components/sidebar/content-selector/content-selector.component';
import { EllipseToolbarComponent } from './components/sidebar/ellipse-toolbar/ellipse-toolbar.component';
import { EraserComponent } from './components/sidebar/eraser-toolbar/eraser.component';
import { LineComponent } from './components/sidebar/line-component/line.component';
import { PencilComponent } from './components/sidebar/pencil-toolbar/pencil.component';
import { PolygonComponent } from './components/sidebar/polygon-toolbar/polygon/polygon.component';
import { RectangleComponent } from './components/sidebar/rectangle-toolbar/rectangle.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SprayComponent } from './components/sidebar/spray/spray-toolbar/spray.component';
import { StampComponent } from './components/sidebar/toolbar-stamp/stamp/stamp.component';
import { UndoRedoComponent } from './components/sidebar/undo-redo/undo-redo/undo-redo.component';
import { WindowButtonsComponent } from './components/sidebar/window-buttons/window-buttons.component';
import { SaveMenuComponent } from './components/windows/create/save-menu.component';
import { ExportWindowComponent } from './components/windows/export/export-window.component';
import { GalleryWindowComponent } from './components/windows/gallery/gallery-window/gallery-window.component';
import { GalleryComponent } from './components/windows/gallery/gallery.component';
import { SaveDrawingComponent } from './components/windows/save/save-drawing.component';
import { ColorService } from './services/color/color.service';
import { FiltersService } from './services/filters/filters.service';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        RectangleComponent,
        SaveMenuComponent,
        EllipseToolbarComponent,
        PencilComponent,
        EraserComponent,
        LineComponent,
        ColorComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        ColorOpacityComponent,
        SaveDrawingComponent,
        ExportWindowComponent,
        UndoRedoComponent,
        ContentSelectorComponent,
        ContentSelectorResizeComponent,
        GalleryComponent,
        GalleryWindowComponent,
        PolygonComponent,
        SprayComponent,
        GridComponent,
        StampComponent,
        CustomSnackbarComponent,
        ClipboardComponent,
        BucketToolbarComponent,
        WindowButtonsComponent,
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, BrowserAnimationsModule, MaterialModule, FormsModule, ReactiveFormsModule],
    providers: [DrawingComponent, ColorService, EditorSelectorService, UndoRedoService, ContentSelectorService, FiltersService, UndoRedoService],
    bootstrap: [AppComponent],
    entryComponents: [CustomSnackbarComponent],
})
export class AppModule {}
