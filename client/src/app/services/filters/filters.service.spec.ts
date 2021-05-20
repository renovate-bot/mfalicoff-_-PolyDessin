import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Constants } from '@app/global/constants';
import { FiltersService } from './filters.service';

// tslint:disable: no-magic-numbers
// tslint:disable: prefer-for-of
describe('FiltersService', () => {
    let service: FiltersService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let secondCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FiltersService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        secondCtxStub = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    });

    it('1 should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2 applyTransparentFilter should change white pixels to black with 0 opacity', () => {
        const rgbaArray = new Uint8ClampedArray(400); // 100 pixels
        for (let i = 0; i < rgbaArray.length; i++) {
            rgbaArray[i] = Constants.RGB_MAX_VALUE;
        }

        const imgd: ImageData = new ImageData(rgbaArray, 100);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.applyTransparentFilter(baseCtxStub, secondCtxStub);

        const rgbaArrayResult = secondCtxStub.getImageData(0, 0, 25, 25).data;

        for (let i = 0; i < rgbaArrayResult.length; i++) {
            expect(rgbaArrayResult[i]).toEqual(0);
        }
    });

    it('3 applyInvColorsFilter should invert all the pixels', () => {
        const color = { r: 100, g: 100, b: 100, a: 100 };

        const rgbaArray = new Uint8ClampedArray(16); // 4 pixels
        for (let i = 0; i < rgbaArray.length; i += 4) {
            rgbaArray[i] = color.r;
            rgbaArray[i + 1] = color.g;
            rgbaArray[i + 2] = color.b;
            rgbaArray[i + 3] = color.a;
        }

        const imgd: ImageData = new ImageData(rgbaArray, 4, 1);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.applyInvColorsFilter(baseCtxStub, secondCtxStub);

        const rgbaArrayResult = secondCtxStub.getImageData(0, 0, 4, 1).data;
        for (let i = 0; i < rgbaArrayResult.length; i += 4) {
            expect(Math.abs(rgbaArrayResult[i] - (255 - color.r))).toBeLessThanOrEqual(1);
            expect(Math.abs(rgbaArrayResult[i + 1] - (255 - color.g))).toBeLessThanOrEqual(1);
            expect(Math.abs(rgbaArrayResult[i + 2] - (255 - color.b))).toBeLessThanOrEqual(1);
        }
    });

    it('4 applyGreyTonesFilter should apply the grey scale algorithme to all pixels', () => {
        const color = { r: 100, g: 100, b: 100, a: 100 };
        const grayscale = color.r * Constants.GREY_SCALE_R + color.g * Constants.GREY_SCALE_G + color.b * Constants.GREY_SCALE_B;
        const changedColor = { r: grayscale, g: grayscale, b: grayscale, a: 100 };

        const rgbaArray = new Uint8ClampedArray(16); // 4 pixels
        for (let i = 0; i < rgbaArray.length; i += 4) {
            rgbaArray[i] = color.r;
            rgbaArray[i + 1] = color.g;
            rgbaArray[i + 2] = color.b;
            rgbaArray[i + 3] = color.a;
        }

        const imgd: ImageData = new ImageData(rgbaArray, 4, 1);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.applyGreyTonesFilter(baseCtxStub, secondCtxStub);

        const rgbaArrayResult = secondCtxStub.getImageData(0, 0, 4, 1).data;
        for (let i = 0; i < rgbaArrayResult.length; i += 4) {
            expect(Math.abs(rgbaArrayResult[i] - changedColor.r)).toBeLessThanOrEqual(1);
            expect(Math.abs(rgbaArrayResult[i + 1] - changedColor.g)).toBeLessThanOrEqual(1);
            expect(Math.abs(rgbaArrayResult[i + 2] - changedColor.b)).toBeLessThanOrEqual(1);
        }
    });
    it('5 applyBlueLightFilter should reduce the blue component of each pixels by its constant value', () => {
        const rgbaArray = new Uint8ClampedArray(16); // 4 (4x1) pixels
        for (let i = 0; i < rgbaArray.length / 2; i++) {
            rgbaArray[i] = Constants.RGB_MAX_VALUE;
        }
        for (let i = 8; i < rgbaArray.length; i++) {
            rgbaArray[i] = 200;
        }
        const imgd: ImageData = new ImageData(rgbaArray, 4, 1);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.applyBlueLightFilter(baseCtxStub, secondCtxStub);

        const rgbaArrayResult = secondCtxStub.getImageData(0, 0, 4, 1).data;
        for (let i = 0; i < rgbaArrayResult.length / 2; i += 4) {
            expect(rgbaArrayResult[i]).toEqual(Constants.RGB_MAX_VALUE);
            expect(rgbaArrayResult[i + 1]).toEqual(Constants.RGB_MAX_VALUE);
            expect(rgbaArrayResult[i + 2]).toEqual(Math.floor(Constants.RGB_MAX_VALUE * Constants.BLUE_LIGHT_REDUCTION_RATIO_WHITE));
        }
        for (let i = 8; i < rgbaArrayResult.length; i += 4) {
            expect(rgbaArrayResult[i]).toEqual(200);
            expect(rgbaArrayResult[i + 1]).toEqual(200);
            expect(rgbaArrayResult[i + 2]).toEqual(200 * Constants.BLUE_LIGHT_REDUCTION_RATIO);
        }
    });
    it('6 copyCtx should copy all pixels', () => {
        const rgbaArray = new Uint8ClampedArray(16); // 4 pixels
        for (let i = 0; i < rgbaArray.length; i++) {
            rgbaArray[i] = Constants.RGB_MAX_VALUE;
        }

        const imgd: ImageData = new ImageData(rgbaArray, 4, 1);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.copyCtx(baseCtxStub, secondCtxStub);

        const rgbaArrayResult = secondCtxStub.getImageData(0, 0, 4, 1).data;

        for (let i = 0; i < rgbaArrayResult.length; i++) {
            expect(rgbaArrayResult[i]).toEqual(Constants.RGB_MAX_VALUE);
        }
    });
    it('7 applyLogoFilter should draw logo on context', () => {
        const rgbaArray = new Uint8ClampedArray(40000); // 100x100 pixels
        for (let i = 0; i < rgbaArray.length; i++) {
            rgbaArray[i] = Constants.RGB_MAX_VALUE;
        }

        const imgd: ImageData = new ImageData(rgbaArray, 100, 100);
        baseCtxStub.putImageData(imgd, 0, 0);
        service.applyLogoFilter(baseCtxStub, secondCtxStub);

        const logo = new Image();
        logo.onload = () => {
            baseCtxStub.drawImage(logo, 100 - Constants.LOGO_WIDTH, 100 - Constants.LOGO_WIDTH, Constants.LOGO_WIDTH, Constants.LOGO_WIDTH);

            const rgbaArrayReference = baseCtxStub.getImageData(
                100 - Constants.LOGO_WIDTH,
                100 - Constants.LOGO_WIDTH,
                Constants.LOGO_WIDTH,
                Constants.LOGO_WIDTH,
            ).data;
            const rgbaArrayResult = secondCtxStub.getImageData(
                100 - Constants.LOGO_WIDTH,
                100 - Constants.LOGO_WIDTH,
                Constants.LOGO_WIDTH,
                Constants.LOGO_WIDTH,
            ).data;

            for (let i = 0; i < rgbaArrayResult.length; i++) {
                expect(rgbaArrayResult[i]).toEqual(rgbaArrayReference[i]);
            }
        };
        logo.src = 'assets/filters/poly_logo.svg.png';
        expect(baseCtxStub).not.toBeUndefined();
    });
});
