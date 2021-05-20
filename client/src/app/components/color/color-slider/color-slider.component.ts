import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas') baseCanvas: ElementRef<HTMLCanvasElement>;

    baseCtx: CanvasRenderingContext2D;
    mousedown: boolean = false;
    selectedHeight: number;

    constructor(public colorService: ColorService) {}

    draw(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        const width = this.baseCanvas.nativeElement.width;
        const height = this.baseCanvas.nativeElement.height;
        this.baseCtx.clearRect(0, 0, width, height);

        const gradient = this.baseCtx.createLinearGradient(0, 0, 0, height);

        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(Constants.COLOR_STEP, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(Constants.COLOR_STEP * 2, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(Constants.COLOR_STEP * Constants.COLOR_STEP_3, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(Constants.COLOR_STEP * Constants.COLOR_STEP_4, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(Constants.COLOR_STEP * Constants.COLOR_STEP_5, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        this.baseCtx.beginPath();
        this.baseCtx.rect(0, 0, width, height);
        this.baseCtx.fillStyle = gradient;
        this.baseCtx.fill();
        this.baseCtx.closePath();

        this.baseCtx.beginPath();
        this.baseCtx.strokeStyle = 'white';
        this.baseCtx.lineWidth = Constants.COLOR_LINEWIDTH;
        this.baseCtx.rect(0, this.selectedHeight - Constants.COLOR_THICKNESS_HEIGHT, width, Constants.COLOR_BOX_THICKNESS);
        this.baseCtx.stroke();
        this.baseCtx.closePath();
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.draw();
    }

    onMouseDown(event: MouseEvent): void {
        this.mousedown = true;
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor(event.offsetX, event.offsetY);
        this.getColorAtPositionFromSlider(event.offsetX, event.offsetY);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mousedown) {
            this.selectedHeight = event.offsetY;
            this.draw();
            this.emitColor(event.offsetX, event.offsetY);
            this.getColorAtPositionFromSlider(event.offsetX, event.offsetY);
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.mousedown = false;
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPositionFromSlider(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPositionFromSlider(x: number, y: number): string {
        const imageData = this.baseCtx.getImageData(x, y, 1, 1).data;
        this.colorService.redSlider = imageData[0];
        this.colorService.greenSlider = imageData[1];
        this.colorService.blueSlider = imageData[2];
        this.colorService.opacity = 1;
        return (
            'rgba(' +
            this.colorService.redSlider +
            ',' +
            this.colorService.greenSlider +
            ',' +
            this.colorService.blueSlider +
            ',' +
            this.colorService.opacity +
            ')'
        );
    }
}
