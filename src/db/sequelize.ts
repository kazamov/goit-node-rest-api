import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
    dialect: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    dialectOptions: {
        ssl: true,
    },
});

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (e) {
    console.log('Cannot connect to DB service: ', e);
    process.exit(1);
}
