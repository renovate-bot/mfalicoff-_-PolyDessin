import { Injectable } from '@angular/core';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/global/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    constructor(protected drawingService: DrawingService) {}
    private dataUndoArray: Data[] = [];
    dataRedoArray: Data[] = [];
    imageFromGallery: HTMLImageElement | null = null;

    undo(): void {
        if (!this.drawingService.isDrawing && this.dataUndoArray.length > 0) {
            const data: Data = this.dataUndoArray.pop() as Data;
            if (data.name !== 'resize') this.dataRedoArray.push(data);
            else {
                const newData: Data = new Data();
                newData.path.push({ x: this.drawingService.width, y: this.drawingService.height } as Vec2);
                newData.name = 'resize';
                this.dataRedoArray.push(newData as Data);
                this.drawingService.width = data.path[0].x;
                this.drawingService.height = data.path[0].y;
                this.drawingService.previewWidth = data.path[0].x;
                this.drawingService.previewHeight = data.path[0].y;
            }
            setTimeout(() => {
                this.drawingService.baseCtx.save();
                this.drawingService.previewCtx.save();
                this.drawingService.baseCtx.clearRect(0, 0, this.drawingService.baseCtx.canvas.width, this.drawingService.baseCtx.canvas.height);
                this.drawingService.previewCtx.clearRect(
                    0,
                    0,
                    this.drawingService.previewCtx.canvas.width,
                    this.drawingService.previewCtx.canvas.height,
                );
                if (this.imageFromGallery) {
                    this.drawingService.baseCtx.drawImage(this.imageFromGallery, 0, 0);
                }

                for (const dataTemp of this.dataUndoArray) {
                    this.drawingService.baseCtx.beginPath();
                    this.drawingService.baseCtx.lineWidth = dataTemp.lineWidth;
                    this.drawingService.baseCtx.strokeStyle = dataTemp.color[0];
                    switch (dataTemp.name) {
                        case 'resize':
                            // do nothing
                            break;
                        case 'paste':
                            this.drawingService.baseCtx.drawImage(dataTemp.selectedArea, dataTemp.initialPosition.x, dataTemp.initialPosition.y);
                            break;
                        case 'cut':
                            this.drawingService.baseCtx.clearRect(
                                dataTemp.finalPosition.x,
                                dataTemp.finalPosition.y,
                                dataTemp.selectedArea.width,
                                dataTemp.selectedArea.height,
                            );
                            break;
                        default:
                            dataTemp.currentTool.redraw(dataTemp); // polymorphism function
                            break;
                    }
                }
                this.drawingService.clearCanvas(this.drawingService.selectorCtx);
                this.drawingService.selectionIsActive = false;
                this.drawingService.areaIsSelected = false;
                this.drawingService.previewCtx.restore();
                this.drawingService.baseCtx.restore();
                this.saveLocalStorage();
            }, Constants.TIMER_DELAY_10);
        }
    }

    redo(): void {
        this.drawingService.selectionIsActive = false;
        this.drawingService.areaIsSelected = false;
        if (!this.drawingService.isDrawing && this.dataRedoArray.length > 0) {
            const dataTemp = this.dataRedoArray.pop() as Data;
            if (dataTemp.name === 'selector' || dataTemp.name === 'resize-selection') {
                this.dataUndoArray.push(dataTemp);
                this.drawingService.baseCtx.clearRect(
                    dataTemp.initialPosition.x,
                    dataTemp.initialPosition.y,
                    dataTemp.initialArea.width,
                    dataTemp.initialArea.height,
                );
                this.drawingService.baseCtx.drawImage(dataTemp.initialArea, dataTemp.initialPosition.x, dataTemp.initialPosition.y);
                this.drawingService.baseCtx.drawImage(dataTemp.selectedArea, dataTemp.finalPosition.x, dataTemp.finalPosition.y);
                this.drawingService.clearCanvas(this.drawingService.selectorCtx);
            } else if (dataTemp.name === 'paste') {
                this.dataUndoArray.push(dataTemp);
                this.drawingService.baseCtx.drawImage(dataTemp.selectedArea, dataTemp.initialPosition.x, dataTemp.initialPosition.y);
            } else if (dataTemp.name === 'cut') {
                this.dataUndoArray.push(dataTemp);
                this.drawingService.baseCtx.clearRect(
                    dataTemp.finalPosition.x,
                    dataTemp.finalPosition.y,
                    dataTemp.selectedArea.width,
                    dataTemp.selectedArea.height,
                );
                this.drawingService.baseCtx.drawImage(dataTemp.finalArea, dataTemp.finalPosition.x, dataTemp.finalPosition.y);
            } else if (dataTemp.name !== 'resize') {
                this.dataUndoArray.push(dataTemp);
                this.drawingService.baseCtx.save();
                this.drawingService.previewCtx.save();
                this.drawingService.baseCtx.beginPath();
                this.drawingService.baseCtx.lineWidth = dataTemp.lineWidth;
                this.drawingService.baseCtx.strokeStyle = dataTemp.color[0];
                dataTemp.currentTool.redraw(dataTemp);
                this.drawingService.previewCtx.restore();
                this.drawingService.baseCtx.restore();
            } else {
                const newData: Data = new Data();
                newData.path.push({ x: this.drawingService.width, y: this.drawingService.height } as Vec2);
                newData.name = 'resize';
                this.dataUndoArray.push(newData as Data);
                const imageData = this.drawingService.baseCtx.getImageData(
                    0,
                    0,
                    this.drawingService.baseCtx.canvas.width,
                    this.drawingService.baseCtx.canvas.height,
                );
                this.drawingService.width = dataTemp.path[0].x;
                this.drawingService.height = dataTemp.path[0].y;
                this.drawingService.previewWidth = dataTemp.path[0].x;
                this.drawingService.previewHeight = dataTemp.path[0].y;
                setTimeout(() => {
                    this.drawingService.baseCtx.putImageData(imageData, 0, 0);
                }, 0);
            }
            this.saveLocalStorage();
        }
    }

    pushToArray(data: Data): void {
        this.dataUndoArray.push(data);
        this.saveLocalStorage();
    }

    saveLocalStorage(): void {
        localStorage.clear();
        localStorage.setItem('image', this.drawingService.baseCtx.canvas.toDataURL());
    }

    resetArrays(): void {
        this.dataRedoArray = [];
        this.dataUndoArray = [];
    }

    popLastItem(): void {
        this.dataUndoArray.pop();
    }

    getLengthUndo(): number {
        return this.dataUndoArray.length;
    }
}
