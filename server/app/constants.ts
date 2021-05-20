/* istanbul ignore file */

export class CONSTANTS {
    static HTTP_STATUS_OK: number = 200;
    static HTTP_STATUS_CREATED: number = 201;
    static HTTP_STATUS_NO_CONTENT: number = 204;
    static HTTP_STATUS_BAD_REQUEST: number = 400;
    static HTTP_STATUS_NOT_FOUND: number = 404;

    static PREFIX_URL: string = 'data:image/png;base64,';
    static IMAGE_FOLDER: string = './images';
    static DATABASE_COLLECTION: string = 'images';
    static DATABASE_NAME: string = 'images';
}
