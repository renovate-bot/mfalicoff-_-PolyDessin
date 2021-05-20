import { Injectable } from '@angular/core';
import { Constants } from '@app/global/constants';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    applyTransparentFilter(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const pix = imgd.data;
        const newColor = { r: 0, g: 0, b: 0, a: 0 };
        for (let i = 0; i < pix.length; i += Constants.PIXEL_INCREMENT) {
            const r = pix[i];
            const g = pix[i + 1];
            const b = pix[i + 2];
            if (r > Constants.RGB_WHITE_TRESHOLD && g > Constants.RGB_WHITE_TRESHOLD && b > Constants.RGB_WHITE_TRESHOLD) {
                pix[i] = newColor.r;
                pix[i + 1] = newColor.g;
                pix[i + 2] = newColor.b;
                pix[i + Constants.INDEX_ALPHA] = newColor.a;
            }
        }
        ctxToReturn.putImageData(imgd, 0, 0);
    }
    applyGreyTonesFilter(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const pix = imgd.data;
        for (let i = 0; i < pix.length; i += Constants.PIXEL_INCREMENT) {
            const grayscale = pix[i] * Constants.GREY_SCALE_R + pix[i + 1] * Constants.GREY_SCALE_G + pix[i + 2] * Constants.GREY_SCALE_B;
            pix[i] = grayscale;
            pix[i + 1] = grayscale;
            pix[i + 2] = grayscale;
        }
        this.applyWhiteBackgroundFilter(imgd);
        ctxToReturn.putImageData(imgd, 0, 0);
    }
    applyInvColorsFilter(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.applyWhiteBackgroundFilter(imgd);
        const pix = imgd.data;
        for (let i = 0; i < pix.length; i += Constants.PIXEL_INCREMENT) {
            const r = pix[i];
            const g = pix[i + 1];
            const b = pix[i + 2];
            pix[i] = Constants.RGB_MAX_VALUE - r;
            pix[i + 1] = Constants.RGB_MAX_VALUE - g;
            pix[i + 2] = Constants.RGB_MAX_VALUE - b;
        }

        ctxToReturn.putImageData(imgd, 0, 0);
    }
    applyBlueLightFilter(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.applyWhiteBackgroundFilter(imgd);
        const pix = imgd.data;

        for (let i = 0; i < pix.length; i += Constants.PIXEL_INCREMENT) {
            const r = pix[i];
            const g = pix[i + 1];
            const b = pix[i + 2];
            if (r !== Constants.RGB_MAX_VALUE && g !== Constants.RGB_MAX_VALUE && b !== Constants.RGB_MAX_VALUE) {
                pix[i + 2] = pix[i + 2] * Constants.BLUE_LIGHT_REDUCTION_RATIO;
            } else {
                pix[i + 2] = pix[i + 2] * Constants.BLUE_LIGHT_REDUCTION_RATIO_WHITE;
            }
        }

        ctxToReturn.putImageData(imgd, 0, 0);
    }

    applyLogoFilter(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        const img = new Image();
        img.src = 'assets/filters/poly_logo.svg.png';
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.applyWhiteBackgroundFilter(imgd);
        ctxToReturn.putImageData(imgd, 0, 0);
        ctxToReturn.drawImage(
            img,
            ctxToReturn.canvas.width - Constants.LOGO_WIDTH,
            ctxToReturn.canvas.height - Constants.LOGO_WIDTH,
            Constants.LOGO_WIDTH,
            Constants.LOGO_WIDTH,
        );
    }

    copyCtx(ctx: CanvasRenderingContext2D, ctxToReturn: CanvasRenderingContext2D): void {
        ctxToReturn.clearRect(0, 0, ctxToReturn.canvas.width, ctxToReturn.canvas.height);
        const imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.applyWhiteBackgroundFilter(imgd);
        ctxToReturn.putImageData(imgd, 0, 0);
    }
    applyWhiteBackgroundFilter(imgd: ImageData): void {
        const pix = imgd.data;
        const newColor = { r: 255, g: 255, b: 255, a: 255 };
        for (let i = 0; i < pix.length; i += Constants.PIXEL_INCREMENT) {
            const r = pix[i];
            const g = pix[i + 1];
            const b = pix[i + 2];
            const a = pix[i + Constants.INDEX_ALPHA];
            if (r === 0 && g === 0 && b === 0 && a === 0) {
                pix[i] = newColor.r;
                pix[i + 1] = newColor.g;
                pix[i + 2] = newColor.b;
                pix[i + Constants.INDEX_ALPHA] = newColor.a;
            }
        }
    }
}
