import { CONSTANTS } from '@app/constants';
import { injectable } from 'inversify';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

@injectable()
export class DatabaseService {
    private db: Db;
    private client: MongoClient | null;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string = process.env.MONGODB_URI as string): Promise<MongoClient> {
        try {
            let client;
            client = await MongoClient.connect(url, this.options);

            this.client = client;
            this.db = client.db(CONSTANTS.DATABASE_NAME);
        } catch {
            this.client = null;
            throw new Error('Database connection error');
        }
        return this.client;
    }

    async closeConnection(): Promise<void> {
        return (this.client as MongoClient).close();
    }

    get database(): Db {
        return this.db;
    }
}
