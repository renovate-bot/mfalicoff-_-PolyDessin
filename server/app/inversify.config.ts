import { ImageController } from '@app/controllers/image.controller';
import { DatabaseService } from '@app/services/database.service';
import { ImageService } from '@app/services/image.service';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.ImageController).to(ImageController);

    container.bind(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
    container.bind(TYPES.ImageService).to(ImageService);

    return container;
};
