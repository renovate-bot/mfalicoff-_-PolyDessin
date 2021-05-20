// tslint:disable:no-duplicate-imports
// tslint:disable: no-any
// tslint:disable:no-unused-expression

import { Application } from '@app/app';
import { TYPES } from '@app/types';
import * as chai from 'chai';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import * as sinonchai from 'sinon-chai';
import * as supertest from 'supertest';
import { DrawingMesssage } from '../../../common/communication/drawing';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { CONSTANTS } from '../constants';
import { ImageService } from '../services/image.service';
import { LocalStorageService } from '../services/local-storage.service';
chai.use(sinonchai);
describe('DrawingController', () => {
    let imageService: Stubbed<ImageService>;
    let app: Express.Application;
    let drawing: DrawingMesssage;

    let stub1: sinon.SinonStub;
    let stub2: sinon.SinonStub;
    let stub3: sinon.SinonStub;

    beforeEach(async () => {
        drawing = {
            title: 'test',
            body: {
                name: 'test',
                tags: ['test', 'test1'],
                url: 'url',
            },
        };
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.ImageService).toConstantValue({
            getAllImages: sandbox.stub().resolves([drawing]),
            addMetadata: sandbox.stub().resolves(),
            deleteImage: sandbox.stub().resolves(),
            validateMetadata: sandbox.stub().returns(true),
        });
        stub1 = sinon.stub(LocalStorageService, 'createImagesFolder').returns();
        stub2 = sinon.stub(LocalStorageService, 'saveImageDisk').returns();
        stub3 = sinon.stub(LocalStorageService, 'deleteImage').returns();
        imageService = container.get(TYPES.ImageService);
        app = container.get<Application>(TYPES.Application).app;
    });

    afterEach(() => {
        stub1.restore();
        stub2.restore();
        stub3.restore();
    });

    it('1. should return all drawings from drawing service on valid get request', async () => {
        return supertest(app)
            .get('/api/image/getAllImages')
            .then((response: any) => {
                expect(response.statusCode).to.equal(CONSTANTS.HTTP_STATUS_OK);
            });
    });

    it('2. should return an error from drawing service on invalid get request ', async () => {
        imageService.getAllImages.usingPromise(Promise).rejects('error');
        return supertest(app)
            .get('/api/image/getAllImages')
            .then((response: any) => {
                expect(response.statusCode).to.equal(CONSTANTS.HTTP_STATUS_NOT_FOUND);
            });
    });

    it('3. should add a drawing in the database on valid post request with a drawing', async () => {
        return supertest(app)
            .post('/api/image/send')
            .send(drawing)
            .set('Accept', 'application/json')
            .then((response: any) => {
                expect(imageService.addMetadata).to.have.been.called;
            });
    });

    it('4. should return an error on invalid post request with a drawing for invalid metadata', async () => {
        const newDrawing = drawing;
        imageService.validateMetadata.returns(false);

        return supertest(app)
            .post('/api/image/send')
            .send(newDrawing)
            .set('Accept', 'application/json')
            .then((response: any) => {
                expect(response.statusCode).to.equal(CONSTANTS.HTTP_STATUS_BAD_REQUEST);
            });
    });

    it('5. should return an error add metadata fail', async () => {
        const newDrawing = drawing;
        imageService.addMetadata.usingPromise(Promise).rejects('error');

        return supertest(app)
            .post('/api/image/send')
            .send(newDrawing)
            .set('Accept', 'application/json')
            .then((response: any) => {
                expect(response.statusCode).to.equal(CONSTANTS.HTTP_STATUS_BAD_REQUEST);
            });
    });

    it('6. should return deletedDrawing id', async () => {
        return supertest(app).delete('/api/image/7392').set('Accept', 'application/json').expect(CONSTANTS.HTTP_STATUS_OK);
    });

    it('7. should return error with error in delete route', async () => {
        imageService.deleteImage.usingPromise(Promise).rejects('error');
        return supertest(app).delete('/api/image/7392').set('Accept', 'application/json').expect(CONSTANTS.HTTP_STATUS_NOT_FOUND);
    });
});
