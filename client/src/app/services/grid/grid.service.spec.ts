import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from './grid.service';

// tslint:disable: no-magic-numbers
describe('GridService', () => {
    let service: GridService;
    let applyGridSpy: jasmine.Spy;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let gridCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(GridService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        gridCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        service.drawingService.baseCtx = baseCtxStub;
        service.drawingService.gridCtx = gridCtxStub;

        applyGridSpy = spyOn(service, 'applyGrid').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('1 createGrid should draw multiple vertical and horizontal line', () => {
        const strokeSpy = spyOn(gridCtxStub, 'stroke');
        const lineToSpy = spyOn(gridCtxStub, 'lineTo');
        service.gridOpacity = 50;
        const blackHex = '#000000';
        drawServiceSpy.width = 100;
        drawServiceSpy.height = 100;
        service.squareDimension = 20;

        service.createGrid(gridCtxStub);
        expect(gridCtxStub.strokeStyle).toEqual(blackHex);
        expect(strokeSpy).toHaveBeenCalledTimes(
            drawServiceSpy.width / service.squareDimension + 1 + drawServiceSpy.height / service.squareDimension + 1,
        );
        expect(lineToSpy).toHaveBeenCalledTimes(
            drawServiceSpy.width / service.squareDimension + 1 + drawServiceSpy.height / service.squareDimension + 1,
        );
    });

    it('2 handleKey change the boolean gridIsVisible value if the user press G', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyG' });
        service.gridIsVisible = true;

        service.handleKey(keyEvent);
        expect(service.gridIsVisible).toEqual(false);
        expect(applyGridSpy).toHaveBeenCalled();
    });

    it('3 handleKey return if the user presses another key than G', () => {
        const event = new KeyboardEvent('1');
        service.gridIsVisible = true;

        service.handleKey(event);
        expect(service.gridIsVisible).toEqual(true);
        expect(applyGridSpy).not.toHaveBeenCalled();
    });

    it('4 applyGrid should call clearCanvas and createGrid on the gridCanvas if gridIsVisible is true', () => {
        const createGridSpy = spyOn(service, 'createGrid').and.callThrough();
        service.gridIsVisible = false;

        service.applyGrid();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(createGridSpy).not.toHaveBeenCalled();
    });

    it('5 applyGrid should not call createGrid on the gridCanvas if gridIsVisible is false', () => {
        const createGridSpy = spyOn(service, 'createGrid').and.callThrough();
        service.gridIsVisible = true;
        service.applyGrid();
        expect(createGridSpy).toHaveBeenCalled();
    });

    it('6 changeSquareDimension add 5 to squareDimension value and call applyGrid if = is press', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'Equal' });
        service.squareDimension = 30;

        service.changeSquareDimension(keyEvent);
        expect(service.squareDimension).toEqual(35);
        expect(applyGridSpy).toHaveBeenCalled();
    });

    it('7 changeSquareDimension set squareDimension to the maximum value if value is too high', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'Equal' });
        service.squareDimension = 105;

        service.changeSquareDimension(keyEvent);
        expect(service.squareDimension).toEqual(100);
    });

    it('8 changeSquareDimension subtract 5 to squareDimension value and call applyGrid if = is press', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'Minus' });
        service.squareDimension = 30;

        service.changeSquareDimension(keyEvent);
        expect(service.squareDimension).toEqual(25);
        expect(applyGridSpy).toHaveBeenCalled();
    });

    it('9 changeSquareDimension set squareDimension to the minimum value if value is too low', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'Minus' });
        service.squareDimension = 5;

        service.changeSquareDimension(keyEvent);
        expect(service.squareDimension).toEqual(20);
    });
});
