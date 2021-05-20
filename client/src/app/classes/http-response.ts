import { DrawingMesssage } from '@common/communication/drawing';

export class HttpResponse {
    isSuccess: boolean = false;
    message: string = '';
    id?: string;
    images?: DrawingMesssage[];
    url?: string;

    constructor(isSuccess: boolean, message: string, id?: string, images?: DrawingMesssage[], url?: string) {
        this.isSuccess = isSuccess;
        this.message = message;
        this.id = id;
        this.images = images;
        this.url = url;
    }
}
