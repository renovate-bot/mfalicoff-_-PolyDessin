import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    redSlider: number = 0;
    blueSlider: number = 0;
    greenSlider: number = 0;
    opacity: number = 1;

    secondaryRed: number = 0;
    secondaryBlue: number = 0;
    secondaryGreen: number = 0;
    secondaryOpacity: number = 1;

    primaryRed: number = 0;
    primaryBlue: number = 0;
    primaryGreen: number = 0;
    primaryOpacity: number = 1;

    redPalette: number = 0;
    bluePalette: number = 0;
    greenPalette: number = 0;

    colorIsPrim: boolean = true;
    constructor(protected drawingService: DrawingService) {}

    setPrimColor(): void {
        this.colorIsPrim = true;
    }

    updateColor(color: string): void {
        this.drawingService.previewCtx.strokeStyle = color;
        this.drawingService.baseCtx.strokeStyle = color;
        this.drawingService.previewCtx.fillStyle = color;
        this.drawingService.baseCtx.fillStyle = color;
    }

    setSecColor(): void {
        this.colorIsPrim = false;
    }
    switchColors(): void {
        const redTemp = this.primaryRed;
        const blueTemp = this.primaryBlue;
        const greenTemp = this.primaryGreen;
        const opacityTemp = this.primaryOpacity;

        this.primaryRed = this.secondaryRed;
        this.primaryBlue = this.secondaryBlue;
        this.primaryGreen = this.secondaryGreen;
        this.primaryOpacity = this.secondaryOpacity;

        this.secondaryRed = redTemp;
        this.secondaryBlue = blueTemp;
        this.secondaryGreen = greenTemp;
        this.secondaryOpacity = opacityTemp;
    }
}
