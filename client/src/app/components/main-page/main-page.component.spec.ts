import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import SpyObj = jasmine.SpyObj;
import { MaterialModule } from '@app/angular-material';
import { GalleryWindowComponent } from '@app/components/windows/gallery/gallery-window/gallery-window.component';
import { GalleryComponent } from '@app/components/windows/gallery/gallery.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { IndexService } from '@app/services/index/index.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    let autoSaveServiceStub: jasmine.SpyObj<AutoSaveService>;

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['basicGet', 'basicPost']);
        indexServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        indexServiceSpy.basicPost.and.returnValue(of());
        autoSaveServiceStub = jasmine.createSpyObj('AutoSaveService', ['loadImage', 'isImageStored']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([]), HttpClientModule, MaterialModule],
            declarations: [MainPageComponent, GalleryComponent, GalleryWindowComponent],
            providers: [{ provide: IndexService, useValue: indexServiceSpy }],
        }).compileComponents();

        autoSaveServiceStub = TestBed.inject(AutoSaveService) as jasmine.SpyObj<AutoSaveService>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(indexServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(indexServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('1. should return value passed by autosave service', () => {
        spyOn(autoSaveServiceStub, 'isImageStored').and.returnValue(false);
        expect(component.ifImageStored()).toEqual(false);
    });

    it('2. should return value passed by autosave service', () => {
        spyOn(autoSaveServiceStub, 'isImageStored').and.returnValue(true);
        expect(component.ifImageStored()).toEqual(true);
    });

    it('4. clear image should clear localStorage', () => {
        const localStorageSpy = spyOn(localStorage, 'clear');
        component.clearImage();
        expect(localStorageSpy).toHaveBeenCalled();
    });

    it('3. should call autosave loadImage', () => {
        const loadSpy = spyOn(autoSaveServiceStub, 'loadImage');
        component.loadSavedImage();
        expect(loadSpy).toHaveBeenCalled();
    });
});
