// tslint:disable:no-unused-expression
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
// @ts-ignore
import * as fs from 'fs';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import * as sinonchai from 'sinon-chai';
import { Metadata } from '../../classes/metadata';
import { LocalStorageService } from './local-storage.service';
chai.use(chaiAsPromised);
chai.use(sinonchai);

describe('Local Storage service', () => {
    let stub1: sinon.SinonStub;
    let stub2: sinon.SinonStub;
    let stub3: sinon.SinonStub;
    let stub4: sinon.SinonStub;
    let stub5: sinon.SinonStub;

    // I am assuming that I myself do not have to tests the actual functionality of the fs library,
    // just my usage of it

    beforeEach(() => {
        stub1 = sinon.stub(fs, 'existsSync').returns(false);
        stub2 = sinon.stub(fs, 'mkdirSync');
        stub3 = sinon.stub(fs, 'writeFileSync');
        stub4 = sinon.stub(fs, 'unlinkSync');
        stub5 = sinon.stub(fs, 'readFileSync');
    });

    afterEach(() => {
        stub1.restore();
        stub2.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
    });

    it('1. should create folder', () => {
        LocalStorageService.createImagesFolder();
        chai.expect(fs.mkdirSync).to.have.been.called;
    });

    it('2. should not call mkdir sync if exists', () => {
        stub1.restore();
        stub1 = sinon.stub(fs, 'existsSync').returns(true);
        LocalStorageService.createImagesFolder();
        chai.expect(fs.mkdirSync).to.not.have.been.called;
    });

    it('3. should save image to disk', () => {
        LocalStorageService.saveImageDisk('random', '1');
        chai.expect(fs.writeFileSync).to.have.been.called;
    });

    it('4. should not save image to disk  with bad info', () => {
        LocalStorageService.saveImageDisk('random', '');
        chai.expect(fs.writeFileSync).to.not.have.been.called;
    });

    it('5. should return empty array', () => {
        const metadata: Metadata[] = [
            {
                name: 'test1',
                tags: [],
            },
            {
                name: 'test2',
                tags: [],
            },
        ];

        const ret = LocalStorageService.loadImages(metadata);
        chai.expect(ret.length).to.equal(0);
    });

    it('6. should return 2 length array', () => {
        stub5.restore();
        const metadata: Metadata[] = [
            {
                name: 'test1',
                tags: [],
            },
            {
                name: 'test2',
                tags: [],
            },
        ];
        stub5 = sinon.stub(fs, 'readFileSync').returns('');
        const ret = LocalStorageService.loadImages(metadata);
        chai.expect(ret.length).to.equal(2);
        stub4.restore();
    });

    it('7. should call unlink if good id', () => {
        const id = '372361298321';
        LocalStorageService.deleteImage(id);
        chai.expect(fs.unlinkSync).to.have.been.called;
    });

    it('8. should not call unlink if bad id', () => {
        const id = '';
        LocalStorageService.deleteImage(id);
        chai.expect(fs.unlinkSync).to.not.have.been.called;
    });
});
