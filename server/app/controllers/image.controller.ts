import { CONSTANTS } from '@app/constants';
import { ImageService } from '@app/services/image.service';
import { LocalStorageService } from '@app/services/local-storage.service';
import { TYPES } from '@app/types';
import { DrawingMesssage } from '@common/communication/drawing';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Metadata } from '../../classes/metadata';

@injectable()
export class ImageController {
    router: Router;

    constructor(@inject(TYPES.ImageService) private imageService: ImageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
            const message: DrawingMesssage = req.body;
            LocalStorageService.createImagesFolder();

            const objectToSave: Metadata = {
                name: message.body.name,
                tags: message.body.tags,
            };

            if (this.imageService.validateMetadata(objectToSave)) {
                const data = message.body.url.replace(/^data:image\/png;base64,/, ''); // removes header for png part of uri
                this.imageService
                    .addMetadata(objectToSave)
                    .then((id) => {
                        LocalStorageService.saveImageDisk(data, id);
                        res.sendStatus(CONSTANTS.HTTP_STATUS_CREATED);
                    })
                    .catch((e: Error) => {
                        res.status(CONSTANTS.HTTP_STATUS_BAD_REQUEST).send(e.message);
                    });
            } else res.status(CONSTANTS.HTTP_STATUS_BAD_REQUEST).send('Le dessin est invalide');
        });

        this.router.get('/getAllImages', async (req: Request, res: Response, next: NextFunction) => {
            this.imageService
                .getAllImages()
                .then((metadata: Metadata[]) => {
                    return res.json(LocalStorageService.loadImages(metadata));
                })
                .catch((e: Error) => {
                    return res.sendStatus(CONSTANTS.HTTP_STATUS_NOT_FOUND);
                });
        });

        this.router.delete('/:imageId', async (req: Request, res: Response, next: NextFunction) => {
            const id = req.params.imageId;
            this.imageService
                .deleteImage(id)
                .then(() => {
                    LocalStorageService.deleteImage(id);
                    res.status(CONSTANTS.HTTP_STATUS_OK).send(id);
                })
                .catch((e: Error) => {
                    return res.status(CONSTANTS.HTTP_STATUS_NOT_FOUND).send(e.message);
                });
        });
    }
}
