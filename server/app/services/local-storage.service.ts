import { CONSTANTS } from '@app/constants';
import { DrawingMesssage } from '@common/communication/drawing';
import * as fs from 'fs';
import { Metadata } from '../../classes/metadata';

export class LocalStorageService {
    static loadImages(metadata: Metadata[]): DrawingMesssage[] {
        const response: DrawingMesssage[] = [];

        for (const singleMeta of metadata) {
            try {
                // @ts-ignore for _id field
                const id = singleMeta._id;

                const file = fs.readFileSync(`${CONSTANTS.IMAGE_FOLDER}/${id}.png`);
                const fileURL = CONSTANTS.PREFIX_URL.concat(file.toString('base64'));

                const newImageMessage: DrawingMesssage = {
                    title: singleMeta.name,
                    body: {
                        tags: singleMeta.tags,
                        url: fileURL,
                        id,
                        name: singleMeta.name,
                    },
                };
                response.push(newImageMessage);
            } catch (err) {
                // metadata exists on server but not locally, so skips that image
                continue;
            }
        }
        return response;
    }

    static createImagesFolder(): void {
        if (!fs.existsSync(CONSTANTS.IMAGE_FOLDER)) {
            fs.mkdirSync(CONSTANTS.IMAGE_FOLDER);
        }
    }

    static saveImageDisk(uri: string, id: string): void {
        if (id !== '' && process.env.NODE_ENV !== 'test') {
            fs.writeFileSync(`${CONSTANTS.IMAGE_FOLDER}/${id}.png`, uri, 'base64');
        }
    }

    static deleteImage(imageId: string): void {
        if (imageId.length > 1 && process.env.NODE_ENV !== 'test') {
            fs.unlinkSync(`${CONSTANTS.IMAGE_FOLDER}/${imageId}.png`);
        }
    }
}
