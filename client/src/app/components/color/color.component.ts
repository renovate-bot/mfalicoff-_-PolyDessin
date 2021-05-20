import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MouseButton } from '@app/classes/mouse-buttons';
import { Constants } from '@app/global/constants';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.scss'],
})
export class ColorComponent implements OnInit {
    constructor(public colorService: ColorService) {}

    hue: string;
    col: string;
    color: string;
    colorSec: string;
    hexColor: string;
    recentColors: HTMLElement[] = new Array(Constants.RECENT_COLOR_NUMBER);
    primaryColor: HTMLElement;
    secondColor: HTMLElement;
    colorSelectorIsVisible: boolean = false;
    modifyingPrimaryColor: boolean = false;
    invalidColorMessage: boolean = false;

    @ViewChild('redHex') redHex: ElementRef;
    @ViewChild('greenHex') greenHex: ElementRef;
    @ViewChild('blueHex') blueHex: ElementRef;
    @ViewChild('color1') color1: ElementRef;
    @ViewChild('color2') color2: ElementRef;
    @ViewChild('color3') color3: ElementRef;
    @ViewChild('color4') color4: ElementRef;
    @ViewChild('color5') color5: ElementRef;
    @ViewChild('color6') color6: ElementRef;
    @ViewChild('color7') color7: ElementRef;
    @ViewChild('color8') color8: ElementRef;
    @ViewChild('color9') color9: ElementRef;
    @ViewChild('color10') color10: ElementRef;

    ngOnInit(): void {
        this.recentColors[Constants.COLOR_0] = document.getElementById('color1') as HTMLElement;
        this.recentColors[Constants.COLOR_1] = document.getElementById('color2') as HTMLElement;
        this.recentColors[Constants.COLOR_2] = document.getElementById('color3') as HTMLElement;
        this.recentColors[Constants.COLOR_3] = document.getElementById('color4') as HTMLElement;
        this.recentColors[Constants.COLOR_4] = document.getElementById('color5') as HTMLElement;
        this.recentColors[Constants.COLOR_5] = document.getElementById('color6') as HTMLElement;
        this.recentColors[Constants.COLOR_6] = document.getElementById('color7') as HTMLElement;
        this.recentColors[Constants.COLOR_7] = document.getElementById('color8') as HTMLElement;
        this.recentColors[Constants.COLOR_8] = document.getElementById('color9') as HTMLElement;
        this.recentColors[Constants.COLOR_9] = document.getElementById('color10') as HTMLElement;
        this.primaryColor = document.getElementById('color-button1') as HTMLElement;
        this.secondColor = document.getElementById('color-button2') as HTMLElement;
    }

    addRecentColor(): void {
        for (let i = Constants.COLOR_9; i > 0; i--) {
            this.recentColors[i].style.backgroundColor = this.recentColors[i - 1].style.backgroundColor;
        }
        this.recentColors[0].style.backgroundColor = this.returnColorString();
    }

    switchPrimAndSecond(): void {
        const temp = this.primaryColor.style.backgroundColor as string;
        this.primaryColor.style.backgroundColor = this.secondColor.style.backgroundColor;
        this.secondColor.style.backgroundColor = temp;
        this.colorService.switchColors();
        if (this.colorService.colorIsPrim) this.colorService.updateColor(this.primaryColor.style.backgroundColor);
        else this.colorService.updateColor(this.secondColor.style.backgroundColor);
    }

    getActualColor(): void {
        if (this.modifyingPrimaryColor) {
            this.primaryColor.style.backgroundColor = this.returnColorString();
            this.colorService.updateColor(this.primaryColor.style.backgroundColor);
            this.colorService.primaryRed = this.colorService.redPalette;
            this.colorService.primaryGreen = this.colorService.greenPalette;
            this.colorService.primaryBlue = this.colorService.bluePalette;
            this.colorService.primaryOpacity = this.colorService.opacity;
        } else {
            this.secondColor.style.backgroundColor = this.returnColorString();
            this.colorService.secondaryRed = this.colorService.redPalette;
            this.colorService.secondaryGreen = this.colorService.greenPalette;
            this.colorService.secondaryBlue = this.colorService.bluePalette;
            this.colorService.secondaryOpacity = this.colorService.opacity;
        }
    }

    setColorSelectorVisibility(): void {
        this.colorSelectorIsVisible = !this.colorSelectorIsVisible;
    }

    setColorToModify(bool: boolean): void {
        this.modifyingPrimaryColor = bool;
    }

    selectPrimOrSecondColor(event: MouseEvent): boolean {
        if (event.button === MouseButton.Left) this.selectPrimColor(event);
        else this.selectSecondColor(event);
        return false;
    }

    selectPrimColor(event: MouseEvent): void {
        if (event.target != null) {
            const newColor = document.getElementById((event.target as Element).id) as HTMLElement;
            this.primaryColor.style.backgroundColor = newColor.style.backgroundColor;
            this.colorService.updateColor(newColor.style.backgroundColor);
        }
    }
    preventCtxMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    selectSecondColor(event: MouseEvent): void {
        if (event.target != null) {
            const newColor = document.getElementById((event.target as Element).id) as HTMLElement;
            this.secondColor.style.backgroundColor = newColor.style.backgroundColor;
            this.colorService.secondaryRed = this.colorService.redPalette;
            this.colorService.secondaryGreen = this.colorService.greenPalette;
            this.colorService.secondaryBlue = this.colorService.bluePalette;
            this.colorService.secondaryOpacity = this.colorService.opacity;
            this.colorService.updateColor(newColor.style.backgroundColor);
        }
    }

    applyHexColor(): void {
        const red = parseInt('0x' + this.redHex.nativeElement.value, 16);
        const green = parseInt('0x' + this.greenHex.nativeElement.value, 16);
        const blue = parseInt('0x' + this.blueHex.nativeElement.value, 16);

        if (this.isHexValid(red, green, blue)) {
            this.colorSelectorIsVisible = false;
            this.colorService.redPalette = red;
            this.colorService.greenPalette = green;
            this.colorService.bluePalette = blue;
            if (this.modifyingPrimaryColor) {
                this.colorService.primaryRed = red;
                this.colorService.primaryGreen = green;
                this.colorService.primaryBlue = blue;
                this.primaryColor.style.backgroundColor = this.returnColorString();
                if (this.colorService.colorIsPrim) this.colorService.updateColor(this.primaryColor.style.backgroundColor);
            } else {
                this.colorService.secondaryRed = red;
                this.colorService.secondaryGreen = green;
                this.colorService.secondaryBlue = blue;
                this.secondColor.style.backgroundColor = this.returnColorString();
                if (!this.colorService.colorIsPrim) this.colorService.updateColor(this.secondColor.style.backgroundColor);
            }
        } else {
            setTimeout(() => {
                this.invalidColorMessage = false;
            }, Constants.TIMER_DELAY_2000);
            this.invalidColorMessage = true;
        }
    }
    isHexValid(red: number, green: number, blue: number): boolean {
        const redFilter = /[0-9A-Fa-f]{2}/g;
        const blueFilter = /[0-9A-Fa-f]{2}/g;
        const greenFilter = /[0-9A-Fa-f]{2}/g;
        return (
            redFilter.test(this.redHex.nativeElement.value) &&
            greenFilter.test(this.greenHex.nativeElement.value) &&
            blueFilter.test(this.blueHex.nativeElement.value) &&
            red <= Constants.RGB_MAX_VALUE &&
            green <= Constants.RGB_MAX_VALUE &&
            blue <= Constants.RGB_MAX_VALUE
        );
    }
    updateContext(color: string, bool: boolean): void {
        this.colorService.updateColor(color);
        this.colorService.colorIsPrim = bool;
    }

    updateBorders(): void {
        if (this.colorService.colorIsPrim) {
            this.primaryColor.style.border = Constants.BORDER;
            this.secondColor.style.border = Constants.BORDER_NONE;
        } else {
            this.primaryColor.style.border = Constants.BORDER_NONE;
            this.secondColor.style.border = Constants.BORDER;
        }
    }

    returnColorString(): string {
        return `rgb(${this.colorService.redPalette},${this.colorService.greenPalette},${this.colorService.bluePalette},${this.colorService.opacity})`;
    }
}
