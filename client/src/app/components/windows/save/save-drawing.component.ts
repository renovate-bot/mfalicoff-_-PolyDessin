import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@app/classes/http-response';
import { Constants } from '@app/global/constants';
import { CommunicationSubscriptionService } from '@app/services/communication/communication-subscriptions/communication-subscription.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { DrawingMesssage } from '@common/communication/drawing';
import { Subscription } from 'rxjs';

interface Tag {
    name: string;
}

@Component({
    selector: 'app-save-drawing',
    templateUrl: './save-drawing.component.html',
    styleUrls: ['./save-drawing.component.scss'],
})
export class SaveDrawingComponent implements OnInit, OnDestroy {
    removable: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    selectable: boolean = true;
    form: FormGroup;
    savingSubscription: Subscription;
    image: string;

    constructor(
        private editorService: EditorSelectorService,
        public drawingService: DrawingService,
        public communicationSub: CommunicationSubscriptionService,
        private notificationService: NotificationService,
        private matDialog: MatDialog,
    ) {
        this.form = new FormGroup({
            name: new FormControl('', [Validators.pattern('^[a-zA-ZÀ-ÿ](\\d|[a-zA-ZÀ-ÿ ]){0,25}$'), Validators.required]),
            tags: new FormControl([]),
        });
    }

    ngOnInit(): void {
        this.savingSubscription = this.communicationSub.imageSaveEventListener().subscribe((res: HttpResponse) => {
            this.notificationService.openSnackBar(res.message, res.isSuccess);
            if (res.isSuccess) {
                this.cancelSave();
            }
        });
    }

    ngOnDestroy(): void {
        this.savingSubscription.unsubscribe();
    }

    get tags(): AbstractControl {
        return this.form.get('tags') as AbstractControl;
    }

    get name(): AbstractControl {
        return this.form.get('name') as AbstractControl;
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if (this.validateTags(value)) {
            this.tags.setValue([...this.tags.value, value.trim()]);
        }

        if (input.value !== '') {
            input.value = '';
        }
    }

    remove(tag: Tag): void {
        const index = this.tags.value.indexOf(tag);

        if (index >= 0) {
            this.tags.value.splice(index, 1);
        }
    }

    cancelSave(): void {
        this.editorService.isSaving = !this.editorService.isSaving;
        this.name.setValue('');
        this.tags.setValue([]);
        this.matDialog.closeAll();
    }

    getIsDrawing(): boolean {
        return this.editorService.isSaving;
    }

    validateTitle(title: string): boolean {
        return title.length > 0 && !this.name.invalid;
    }

    validateTags(tag: string): boolean {
        return (
            tag.length > 0 &&
            /^[a-zA-ZÀ-ÿ](\\d|[a-zA-ZÀ-ÿ ]){0,12}$/.test(tag) &&
            tag.indexOf(' ') === Constants.ITEM_NOT_FOUND &&
            this.tags.value.indexOf(tag) === Constants.ITEM_NOT_FOUND
        );
    }

    save(): void {
        this.drawingService.clearCanvas(this.drawingService.selectorCtx);
        this.drawingService.selectionIsActive = false;

        const formDetails = {
            name: this.name.value,
            tags: this.tags.value,
        };
        const canvas = this.drawingService.baseCtx.canvas.toDataURL();

        const newDrawingMessage: DrawingMesssage = {
            title: formDetails.name,
            body: {
                name: formDetails.name,
                tags: formDetails.tags,
                url: canvas,
            },
        };
        this.communicationSub.postImage(newDrawingMessage);
    }
}
