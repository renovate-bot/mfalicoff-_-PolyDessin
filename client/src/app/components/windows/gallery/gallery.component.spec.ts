import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { MaterialModule } from '@app/angular-material';
import { GalleryWindowComponent } from '@app/components/windows/gallery/gallery-window/gallery-window.component';
import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
    let component: GalleryComponent;
    let fixture: ComponentFixture<GalleryComponent>;

    const matDialogSpy = {
        open: () => {
            return {};
        },
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GalleryComponent, GalleryWindowComponent],
            imports: [MaterialModule, HttpClientModule],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GalleryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('1. should create', () => {
        expect(component).toBeTruthy();
    });

    it('2. should open dialog on call to open Gallery Window', () => {
        const spyDialog = spyOn(matDialogSpy, 'open');
        component.openGalleryWindow();
        expect(spyDialog).toHaveBeenCalled();
    });
});
