import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '@app/components/custom-snackbar/custom-snackbar.component';
import { Constants } from '@app/global/constants';
import { CommunicationSubscriptionService } from '@app/services/communication/communication-subscriptions/communication-subscription.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FiltersService } from '@app/services/filters/filters.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-export-window',
    templateUrl: './export-window.component.html',
    styleUrls: ['./export-window.component.scss'],
})
export class ExportWindowComponent implements OnInit, OnDestroy {
    nameFormControl: FormControl = new FormControl('', [Validators.required]);
    choicesControl: FormControl = new FormControl('', Validators.required);
    filterFormControl: FormControl = new FormControl('', Validators.required);
    format: string = 'png';
    filter: string = 'none';
    fileName: string = 'Untitled';
    isExporting: boolean = false;
    infoIsVisible: boolean = false;

    postImageSub: Subscription;

    canvasWidth: number;
    canvasHeight: number;

    @ViewChild('canvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    baseCtx: CanvasRenderingContext2D;
    ctxToExport: CanvasRenderingContext2D;
    isLoading: boolean = false;

    constructor(
        public editorService: EditorSelectorService,
        public drawingService: DrawingService,
        public filterService: FiltersService,
        private communicationSub: CommunicationSubscriptionService,
        private snackbar: MatSnackBar,
        private notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.postImageSub = this.communicationSub.imagePostImgurEventListener().subscribe((res) => {
            this.isLoading = false;
            if (!res.isSuccess) {
                this.notificationService.openSnackBar(res.message, res.isSuccess);
                return;
            }
            const imgurUrl = (res.url as string).replace(/\.[^.]*$/, '');
            this.snackbar.openFromComponent(CustomSnackbarComponent, {
                data: {
                    html: `<h1>Imgur</h1><p>Le dessin est enregistré au lien: <a href="${imgurUrl}" target="_blank">image</a></p>`,
                },
                panelClass: ['custom-style'],
            });
        });
    }

    ngOnDestroy(): void {
        this.postImageSub.unsubscribe();
    }

    updateView(): void {
        setTimeout(() => {
            this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxToExport = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
            this.ctxToExport.canvas.width = this.drawingService.canvas.width;
            this.ctxToExport.canvas.height = this.drawingService.canvas.height;
            this.resizePreviewCanvas();
            this.updateContext();
            this.drawPreview();
        }, Constants.TIMER_DELAY_20);
    }

    exportDrawing(): void {
        const inputElement = document.getElementById('input') as HTMLInputElement;

        if (inputElement.value.length === 0) this.fileName = 'Untitled';
        else this.fileName = inputElement.value;

        this.updateContext();
        if (this.filter === 'polyLogo') this.drawLogo(this.ctxToExport, Constants.LOGO_WIDTH);

        setTimeout(() => {
            const img = this.ctxToExport.canvas.toDataURL('image/' + this.format);
            const image = document.createElement('a');
            image.href = img;
            image.download = this.fileName + '.' + this.format;
            document.body.appendChild(image);
            image.click();
        }, Constants.TIMER_DELAY_200);

        this.hideWindow();
    }

    updateContext(): void {
        switch (this.filter) {
            case 'transparent':
                if (this.format === 'jpeg') this.filterService.copyCtx(this.drawingService.baseCtx, this.ctxToExport);
                else this.filterService.applyTransparentFilter(this.drawingService.baseCtx, this.ctxToExport);
                break;
            case 'none':
                this.filterService.copyCtx(this.drawingService.baseCtx, this.ctxToExport);
                break;
            case 'greyLevels':
                this.filterService.applyGreyTonesFilter(this.drawingService.baseCtx, this.ctxToExport);
                break;
            case 'invColors':
                this.filterService.applyInvColorsFilter(this.drawingService.baseCtx, this.ctxToExport);
                break;
            case 'polyLogo':
                this.filterService.applyLogoFilter(this.drawingService.baseCtx, this.ctxToExport);
                break;
            case 'blueLight':
                this.filterService.applyBlueLightFilter(this.drawingService.baseCtx, this.ctxToExport);
                break;
        }
    }
    drawPreview(): void {
        const img = new Image();
        this.baseCtx.clearRect(0, 0, this.baseCtx.canvas.width, this.baseCtx.canvas.height);
        img.onload = () => {
            this.baseCtx.drawImage(img, 0, 0, this.baseCtx.canvas.width, this.baseCtx.canvas.height);
            if (this.filter === 'polyLogo') this.drawLogo(this.baseCtx, Constants.LOGO_WIDTH_PREVIEW);
        };
        img.src = this.ctxToExport.canvas.toDataURL('image/png');
    }
    drawLogo(ctxCopy: CanvasRenderingContext2D, width: number): void {
        const logo = new Image();
        logo.src = 'assets/filters/poly_logo.svg.png';
        logo.onload = () => {
            ctxCopy.drawImage(logo, ctxCopy.canvas.width - width, ctxCopy.canvas.height - width, width, width);
        };
    }
    updateFormat(event: MatSelectChange): void {
        this.format = event.value;
    }
    updateFilter(event: MatSelectChange): void {
        this.filter = event.value;
        this.updateContext();
        this.drawPreview();
    }
    getIsExporting(): boolean {
        if (!this.isExporting && this.editorService.isExporting) this.updateView();
        this.isExporting = this.editorService.isExporting;
        return this.editorService.isExporting;
    }
    hideWindow(): void {
        this.editorService.isExporting = false;
    }
    resizePreviewCanvas(): void {
        const canvasContainer = document.getElementById('canvas-box') as HTMLElement;
        let ratio = 0;
        if (this.drawingService.canvas.width > this.drawingService.canvas.height)
            ratio = this.drawingService.canvas.width / (canvasContainer.getBoundingClientRect().width - Constants.BORDER_CANVAS_BUFFER);
        else ratio = this.drawingService.canvas.height / (canvasContainer.getBoundingClientRect().height - Constants.BORDER_CANVAS_BUFFER);

        this.canvasWidth = this.drawingService.canvas.width / ratio - Constants.CANVAS_BORDER * 2;
        this.canvasHeight = this.drawingService.canvas.height / ratio - Constants.CANVAS_BORDER * 2;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.code === 'KeyE' && this.editorService.isExporting) this.updateView();
        if (event.code === 'Escape') this.hideWindow();
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (event.composedPath().length === Constants.HTML_PAGE_DEPTH) this.hideWindow();
    }

    exportToImgur(): void {
        if (this.filter === 'polyLogo') this.drawLogo(this.ctxToExport, Constants.LOGO_WIDTH);
        setTimeout(() => {
            const imageUrl = this.ctxToExport.canvas.toDataURL('image/' + this.format);
            const imageData =
                this.format === 'png' ? imageUrl.replace(/^data:image\/png;base64,/, '') : imageUrl.replace(/^data:image\/jpeg;base64,/, '');

            const formData = new FormData();
            formData.append('image', imageData);
            formData.append('type', `image/${this.format}`);
            this.isLoading = true;
            this.communicationSub.postImageImgur(formData);
        }, Constants.TIMER_DELAY_200);
    }
}
