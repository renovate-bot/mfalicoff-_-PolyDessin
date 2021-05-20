import { Tool } from './tool';
import { Vec2 } from './vec2';
export class Data {
    constructor() {
        this.path = [];
        this.color = [];
    }
    currentTool: Tool;
    name: string;
    path: Vec2[];
    lineWidth: number;
    dropletSize: number;
    diameterSize: number;
    polygonSideNumber: number;
    polygonBorderFull: boolean;
    color: string[];
    toolPropriety: string;
    initialPosition: Vec2;
    finalPosition: Vec2;
    initialArea: HTMLCanvasElement;
    selectedArea: HTMLCanvasElement;
    finalArea: HTMLCanvasElement;

    pixelsStack: Vec2[];
    paintColor: number[];
    pixelCoord: Vec2;
    imageData: ImageData;
    pixelColorRange: number[];
    bucketFillType: string;

    rotationAngle: number;
    stampSize: number;
    imageStamp: string;
}
