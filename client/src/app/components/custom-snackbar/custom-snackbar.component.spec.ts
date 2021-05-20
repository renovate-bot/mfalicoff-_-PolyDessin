import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MaterialModule } from '@app/angular-material';

import { CustomSnackbarComponent } from './custom-snackbar.component';

describe('CustomSnackbarComponent', () => {
    let component: CustomSnackbarComponent;
    let fixture: ComponentFixture<CustomSnackbarComponent>;
    let snackRefSpy: jasmine.SpyObj<MatSnackBarRef<CustomSnackbarComponent>>;

    beforeEach(async(() => {
        snackRefSpy = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);
        TestBed.configureTestingModule({
            imports: [MaterialModule, MatSnackBarModule],
            declarations: [CustomSnackbarComponent],
            providers: [
                {
                    provide: MatSnackBarRef,
                    useValue: snackRefSpy,
                },
                {
                    provide: MAT_SNACK_BAR_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();
        snackRefSpy = TestBed.inject(MatSnackBarRef) as jasmine.SpyObj<MatSnackBarRef<CustomSnackbarComponent>>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomSnackbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close on close', () => {
        component.close();
        expect(snackRefSpy.dismiss).toHaveBeenCalled();
    });
});
