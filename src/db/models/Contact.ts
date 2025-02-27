import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

export class Contact extends Model<InferAttributes<Contact>, InferCreationAttributes<Contact>> {
    declare id?: CreationOptional<string>;
    declare name: string;
    declare email: string;
    declare phone: string;
    declare favorite: boolean;
    declare owner: string;
}

Contact.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        owner: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    { sequelize },
);

await Contact.sync();
