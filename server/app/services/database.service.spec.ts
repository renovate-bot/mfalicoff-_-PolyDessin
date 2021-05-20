/* tslint:disable:no-any no-magic-numbers */
/* tslint:disable:no-any no-string-literal */
// tslint:disable:no-unused-expression

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TYPES } from '../types';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised);

import { testingContainer } from '../../test/test-utils';

describe('Database Service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            databaseService = instance[0].get<DatabaseService>(TYPES.DatabaseService);
        });

        mongoServer = new MongoMemoryServer();
    });

    it('1. should instantiate correctly', (done: Mocha.Done) => {
        chai.expect(databaseService).to.be.instanceOf(DatabaseService);
        chai.expect(databaseService).to.be.instanceOf(DatabaseService);
        done();
    });

    it('2. should connect to the database when start is called with url as param', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        chai.expect(databaseService['client']).to.not.be.undefined;
        chai.expect(databaseService['db'].databaseName).to.equal('images');
    });

    it('3. should connect to the database when start is called without param', async () => {
        await databaseService.start();
        chai.expect(databaseService['client']).to.not.be.undefined;
        chai.expect(databaseService['db'].databaseName).to.equal('images');
    });

    it('4. should not connect to the server if error', async () => {
        let mongoUri = await mongoServer.getUri();
        mongoUri = mongoUri + 'random';
        try {
            await databaseService.start(mongoUri);
        } catch (e) {
            chai.expect(e);
        }
    });

    it('5. should no longer be connected if close is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        chai.expect(databaseService['client']?.isConnected()).to.be.false;
    });

    it('6. should return database', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        chai.expect(databaseService.database).to.not.be.undefined;
    });
});
