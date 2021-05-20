import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
    selector: 'app-custom-snackbar',
    templateUrl: './custom-snackbar.component.html',
    styleUrls: ['./custom-snackbar.component.scss'],
})
export class CustomSnackbarComponent {
    // tslint:disable-next-line:no-any have to allow any since any type of message can be displayed
    constructor(private snackBarRef: MatSnackBarRef<CustomSnackbarComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {}

    close(): void {
        this.snackBarRef.dismiss();
    }
}
