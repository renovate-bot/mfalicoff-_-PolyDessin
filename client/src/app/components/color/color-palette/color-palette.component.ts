import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @Input()
    hue: string;

    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas') baseCanvas: ElementRef<HTMLCanvasElement>;

    initalized: boolean = false;
    baseCtx: CanvasRenderingContext2D;
    mousedown: boolean = false;
    selectedPosition: { x: number; y: number };

    width: number;
    height: number;

    constructor(public colorService: ColorService) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.width = this.baseCanvas.nativeElement.width;
        this.height = this.baseCanvas.nativeElement.height;
        this.initalized = true;
        this.selectedPosition = {
            x: 0,
            y: 0,
        };
    }

    draw(): void {
        this.baseCtx.fillStyle =
            'rgba(' +
            this.colorService.redSlider +
            ',' +
            this.colorService.greenSlider +
            ',' +
            this.colorService.blueSlider +
            this.colorService.opacity +
            ')';
        this.baseCtx.fillRect(0, 0, this.width, this.height);

        const whiteGrad = this.baseCtx.createLinearGradient(0, 0, this.width, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

        this.baseCtx.fillStyle = whiteGrad;
        this.baseCtx.fillRect(0, 0, this.width, this.height);

        const blackGrad = this.baseCtx.createLinearGradient(0, 0, 0, this.height);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

        this.baseCtx.fillStyle = blackGrad;
        this.baseCtx.fillRect(0, 0, this.width, this.height);

        this.baseCtx.strokeStyle = 'white';
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.beginPath();
        this.baseCtx.arc(this.selectedPosition.x, this.selectedPosition.y, Constants.COLOR_BOX_THICKNESS, 0, 2 * Math.PI);
        this.baseCtx.lineWidth = Constants.COLOR_LINEWIDTH;
        this.baseCtx.stroke();
    }

    ngOnChanges(): void {
        if (this.initalized) {
            this.draw();
            const pos = this.selectedPosition;
            this.color.emit(this.getColorAtPositionFromPalette(pos.x, pos.y));
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.mousedown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mousedown = true;
        this.selectedPosition = { x: event.offsetX, y: event.offsetY };
        this.draw();
        this.color.emit(this.getColorAtPositionFromPalette(event.offsetX, event.offsetY));
        this.getColorAtPositionFromPalette(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mousedown) {
            this.selectedPosition = { x: event.offsetX, y: event.offsetY };
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
            this.getColorAtPositionFromPalette(event.offsetX, event.offsetY);
        }
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPositionFromPalette(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPositionFromPalette(x: number, y: number): string {
        const imageData = this.baseCtx.getImageData(x, y, 1, 1).data;
        this.colorService.redPalette = imageData[0];
        this.colorService.greenPalette = imageData[1];
        this.colorService.bluePalette = imageData[2];
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
