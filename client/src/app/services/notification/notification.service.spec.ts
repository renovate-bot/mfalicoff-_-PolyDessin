import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;

    const mockSnackbar = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: mockSnackbar }],
        });
        service = TestBed.inject(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('1. should open a snackBar with normal panelClass', () => {
        service.openSnackBar('test', true);
        expect(mockSnackbar.open).toHaveBeenCalled();
    });

    it('2. should open a snackBar with error panelClass', () => {
        service.openSnackBar('test', false);
        expect(mockSnackbar.open).toHaveBeenCalled();
    });
});
