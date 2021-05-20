import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-opacity',
    templateUrl: './color-opacity.component.html',
    styleUrls: ['./color-opacity.component.scss'],
})
export class ColorOpacityComponent implements AfterViewInit, OnChanges {
    @Input()
    col: string;

    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas') baseCanvas: ElementRef<HTMLCanvasElement>;

    baseCtx: CanvasRenderingContext2D;
    mousedown: boolean = false;
    selectedHeight: number;
    initalized: boolean = false;

    width: number;
    height: number;

    constructor(public colorService: ColorService) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.width = this.baseCanvas.nativeElement.width;
        this.height = this.baseCanvas.nativeElement.height;
        this.initalized = true;
    }

    draw(): void {
        const gradient = this.baseCtx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, this.couleurZeroOpacity());
        gradient.addColorStop(1, this.actualColor());

        this.baseCtx.beginPath();
        this.baseCtx.rect(0, 0, this.width, this.height);
        this.baseCtx.fillStyle = gradient;
        this.baseCtx.fill();
        this.baseCtx.closePath();

        this.baseCtx.beginPath();
        this.baseCtx.strokeStyle = 'white';
        this.baseCtx.lineWidth = Constants.COLOR_LINEWIDTH;
        this.baseCtx.rect(0, this.selectedHeight - Constants.COLOR_THICKNESS_HEIGHT, this.width, Constants.COLOR_BOX_THICKNESS);
        this.baseCtx.stroke();
        this.baseCtx.closePath();
    }

    ngOnChanges(): void {
        if (this.initalized) {
            this.draw();
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mousedown = true;
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mousedown) {
            this.selectedHeight = event.offsetY;
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.mousedown = false;
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getOpacityAtPosition();
        this.color.emit(rgbaColor);
    }

    actualColor(): string {
        return 'rgba(' + this.colorService.redPalette + ',' + this.colorService.greenPalette + ',' + this.colorService.bluePalette + ',1)';
    }

    couleurZeroOpacity(): string {
        return 'rgba(' + this.colorService.redPalette + ',' + this.colorService.greenPalette + ',' + this.colorService.bluePalette + ',0)';
    }

    getOpacityAtPosition(): string {
        this.colorService.opacity = this.selectedHeight;
        (this.colorService.opacity /= 100).toPrecision(3);
        return (
            'rgba(' +
            this.colorService.redPalette +
            ',' +
            this.colorService.greenPalette +
            ',' +
            this.colorService.bluePalette +
            ',' +
            this.colorService.opacity +
            ')'
        );
    }
}
