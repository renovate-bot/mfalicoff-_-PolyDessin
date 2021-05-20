// tslint:disable:no-any
// tslint:disable:no-shadowed-variable

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { Metadata } from '../../classes/metadata';
import { DatabaseServiceMock } from './database.service.mock';
import { ImageService } from './image.service';
chai.use(chaiAsPromised);

describe('Images service', () => {
    let imageService: ImageService;
    let databaseService: DatabaseServiceMock;
    let client: MongoClient;
    let metadata: Metadata;

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        client = (await databaseService.start()) as MongoClient;
        imageService = new ImageService(databaseService as any);
        metadata = {
            name: 'Test metadata1',
            tags: ['testtag1', 'testtag2'],
        };
        await imageService.addMetadata(metadata);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('1. should get all metadata from DB', async () => {
        const allMetadata = await imageService.getAllImages();
        chai.expect(allMetadata.length).to.equal(1);
        chai.expect(metadata).to.deep.equals(allMetadata[0]);
    });

    it('2. should insert a new metadata', async () => {
        const secondAddMetadata: Metadata = {
            name: 'Test metadata2',
            tags: ['testtag1', 'testtag2'],
        };

        await imageService.addMetadata(secondAddMetadata);
        const metadata = await imageService.collection.find({}).toArray();
        chai.expect(metadata.length).to.equal(2);
        chai.expect(metadata.find((x) => x.name === secondAddMetadata.name)).to.deep.equals(secondAddMetadata);
    });

    it('3. should delete a metadata from db', async () => {
        const secondAddMetadata: Metadata = {
            name: 'Test metadata2',
            tags: ['testtag1', 'testtag2'],
        };
        const id = await imageService.addMetadata(secondAddMetadata);
        await imageService.deleteImage(id);
        const metadata = await imageService.collection.find({}).toArray();
        chai.expect(metadata.length).to.equal(1);
    });

    // Error handling
    describe('Error handling', async () => {
        it('4. should throw an error if we try to get all courses on a closed connection', async () => {
            await client.close();
            chai.expect(imageService.getAllImages()).to.eventually.be.rejectedWith(Error);
        });

        it('5. should throw an error with bad id', async () => {
            await client.close();
            chai.expect(imageService.deleteImage('000000000000')).to.eventually.be.rejectedWith('Erreur de suppression');
        });
    });

    // Validation
    describe('Metadata Validation', async () => {
        it('6. should return true for good name', () => {
            chai.expect(imageService.validateName('name')).to.be.equal(true);
        });

        it('7. should return false for bad name', () => {
            chai.expect(imageService.validateName('^%$^&%&')).to.be.equal(false);
        });

        it('8. should return true for good tags', () => {
            const tags: string[] = ['tag', 'tag'];
            chai.expect(imageService.validateTags(tags)).to.be.equal(true);
        });

        it('9. should return false for bad tags', () => {
            const tags: string[] = ['$%^$^%', 'tag2'];
            chai.expect(imageService.validateTags(tags)).to.be.equal(false);
        });

        it('10. should Validate metadata', () => {
            const meta: Metadata = {
                name: 'name',
                tags: ['tags'],
            };
            chai.expect(imageService.validateMetadata(meta)).to.be.equal(true);
        });
    });
});
