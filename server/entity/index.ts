import {Connection, createConnection} from "typeorm/index";
import {Image} from './Image';

const entities = [
    Image
];

export const connection: Promise<Connection> = new Promise((resolve, reject) => {
    createConnection({
        type: 'postgres',
        name: 'jimaku-player',
        host: 'postgres',
        port: 5432,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        logging: ['error'],
        entities
    }).then(async connection => {
        resolve(connection);
    }).catch(error => {
        console.error('Error connecting to database!')
        console.error(error);
        reject(error);
    });
});

export const imageRepository = connection.then(c => c.getRepository(Image));