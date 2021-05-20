import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Constants } from '@app/global/constants';
import { CommunicationSubscriptionService } from '@app/services/communication/communication-subscriptions/communication-subscription.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingMesssage } from '@common/communication/drawing';
import { GalleryImage } from '@common/communication/gallery';
import { Subscription } from 'rxjs';

interface Tag {
    name: string;
}

@Component({
    selector: 'app-gallery-window',
    templateUrl: './gallery-window.component.html',
    styleUrls: ['./gallery-window.component.scss'],
})
export class GalleryWindowComponent implements OnDestroy, OnInit, AfterContentInit {
    images: GalleryImage[] = [];
    imagesToShow: GalleryImage[] = [];
    filteredImages: GalleryImage[] = [];
    tags: Tag[] = [];
    imageToLoad: HTMLImageElement;

    deleteSubscription: Subscription;
    getSubscription: Subscription;

    preventNext: boolean = false;
    preventPrevious: boolean = false;
    removable: boolean = true;
    isLoading: boolean = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private drawingService: DrawingService,
        private dialog: MatDialog,
        public communicationSub: CommunicationSubscriptionService,
        private undoRedoService: UndoRedoService,
        private notificationService: NotificationService,
    ) {}

    ngAfterContentInit(): void {
        this.getDrawings();
    }

    ngOnInit(): void {
        this.deleteSubscription = this.communicationSub.imageDeleteEventListener().subscribe((res) => {
            this.notificationService.openSnackBar(res.message, res.isSuccess);
            if (res.isSuccess) {
                this.images = this.images.filter((image) => image.id !== res.id);
                this.filteredImages = this.filteredImages.filter((image) => image.id !== res.id);
                this.resetImagesToShow();
            } else {
                this.getDrawings();
                if (this.tags.length > 0) this.updateFilter();
                this.resetImagesToShow();
            }
        });

        this.getSubscription = this.communicationSub.imageGetterEventListener().subscribe((res) => {
            this.isLoading = false;
            if (res.isSuccess && res.images) {
                this.format(res.images);
                this.filteredImages = this.images;
                this.resetImagesToShow();
            } else {
                this.notificationService.openSnackBar(res.message, res.isSuccess);
            }
        });
    }

    ngOnDestroy(): void {
        this.deleteSubscription.unsubscribe();
        this.getSubscription.unsubscribe();
    }

    getDrawings(): void {
        this.isLoading = true;
        this.images = [];
        this.communicationSub.getImages();
    }

    format(nonFormattedImages: DrawingMesssage[]): void {
        for (const image of nonFormattedImages) {
            this.images.push(image.body as GalleryImage);
        }
    }

    loadImage(event: MouseEvent, i: number): void {
        if (i === 1) {
            if (!this.drawingService.canvasIsBlank()) {
                if (confirm('Vous avez un dessin en cours, voulez vous le supprimer?')) {
                    this.createImage(event);
                    return;
                } else return;
            }
            this.createImage(event);
        }
    }

    createImage(event: MouseEvent): void {
        this.imageToLoad = new Image();
        this.imageToLoad.crossOrigin = '';
        this.imageToLoad.src = (event.target as HTMLMediaElement).currentSrc;
        this.imageToLoad.onload = () => {
            this.insertImageOnCanvas(this.imageToLoad);
        };
    }

    insertImageOnCanvas(image: HTMLImageElement): void {
        setTimeout(() => {
            const ctx = this.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
            this.drawingService.clearCanvas(ctx as CanvasRenderingContext2D);
            this.drawingService.updateCanvasSize(image.width, image.height);
            this.drawingService.baseCtx.drawImage(image, 0, 0);
            this.undoRedoService.resetArrays();
            this.undoRedoService.imageFromGallery = image;
            this.dialog.closeAll();
        }, Constants.TIMER_DELAY_100);
        this.drawingService.updateSize(image.width, image.height);
    }

    deleteImage(id: number): void {
        this.communicationSub.deleteImage(id);
    }

    nextImage(): void {
        const newPrevIm = this.imagesToShow[1];
        const newCurrIm = this.imagesToShow[2];
        const newImageToShowIndex = (this.filteredImages.indexOf(newCurrIm) + 1) % this.filteredImages.length;

        this.imagesToShow[0] = newPrevIm;
        this.imagesToShow[1] = newCurrIm;
        this.imagesToShow[2] = this.filteredImages[newImageToShowIndex];
    }

    previousImage(): void {
        const newNextIm = this.imagesToShow[1];
        const newCurrIm = this.imagesToShow[0];
        const newImageToShowIndex =
            this.filteredImages.indexOf(newCurrIm) === 0 ? this.filteredImages.length - 1 : this.filteredImages.indexOf(newCurrIm) - 1;

        this.imagesToShow[0] = this.filteredImages[newImageToShowIndex];
        this.imagesToShow[1] = newCurrIm;
        this.imagesToShow[2] = newNextIm;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'ArrowRight':
                if (!this.preventNext) this.nextImage();
                break;
            case 'ArrowLeft':
                if (!this.preventPrevious) this.previousImage();
                break;
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if (this.validateTags(value)) {
            this.tags.push({ name: value.trim() });
        }

        if (input && this.validateTags(value)) {
            input.value = '';
        }
        this.updateFilter();
    }

    remove(tag: Tag): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
        this.updateFilter();
    }

    updateFilter(): void {
        this.filteredImages = [];
        if (this.tags.length === 0) this.filteredImages = this.images;
        else {
            for (const image of this.images) {
                for (const tagName of this.tags) {
                    if (
                        image.tags.indexOf(tagName.name) !== Constants.ITEM_NOT_FOUND &&
                        this.filteredImages.indexOf(image) === Constants.ITEM_NOT_FOUND
                    ) {
                        this.filteredImages.push(image);
                    }
                }
            }
        }
        this.resetImagesToShow();
    }

    validateTags(tag: string): boolean {
        return tag.length > 0 && /^[a-zA-ZÀ-ÿ](\\d|[a-zA-ZÀ-ÿ ]){0,12}$/.test(tag) && tag.indexOf(' ') === Constants.ITEM_NOT_FOUND;
    }

    resetImagesToShow(): void {
        this.imagesToShow = this.filteredImages.slice(0, 2);
        if (this.filteredImages.length > 2) {
            this.imagesToShow.unshift(this.filteredImages[this.filteredImages.length - 1]);
            this.preventPrevious = false;
            this.preventNext = false;
        } else {
            this.preventPrevious = true;
            this.preventNext = true;
        }
    }
}
