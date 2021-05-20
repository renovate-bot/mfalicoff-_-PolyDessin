import { CONSTANTS } from '@app/constants';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { Collection, ObjectID } from 'mongodb';
import 'reflect-metadata';
import { Metadata } from '../../classes/metadata';
import { DatabaseService } from './database.service';

@injectable()
export class ImageService {
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

    get collection(): Collection<Metadata> {
        return this.databaseService.database.collection(CONSTANTS.DATABASE_COLLECTION);
    }

    async getAllImages(): Promise<Metadata[]> {
        return this.collection
            .find({})
            .toArray()
            .then((images: Metadata[]) => {
                return images;
            });
    }

    async addMetadata(metadata: Metadata): Promise<string> {
        const returnedId: Promise<string> = this.collection.insertOne(metadata).then((result) => {
            return result.insertedId.toHexString();
        });

        return await returnedId;
    }

    validateMetadata(metadata: Metadata): boolean {
        return this.validateName(metadata.name) && this.validateTags(metadata.tags);
    }

    validateTags(tags: string[]): boolean {
        const regex = /^[a-zA-ZÀ-ÿ](\\d|[a-zA-ZÀ-ÿ ]){0,12}$/;

        for (const tag of tags) {
            if (!regex.test(tag)) {
                return false;
            }
        }
        return true;
    }

    validateName(name: string): boolean {
        const regex = /^[a-zA-ZÀ-ÿ](\d|[a-zA-ZÀ-ÿ ]){0,25}$/;
        const res = name.length > 0 && regex.test(name);
        return res;
    }

    async deleteImage(imageId: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectID(imageId) }).catch((e: Error) => {
            throw new Error(`Erreur de suppression: ${e.message}`);
        });
    }
}
