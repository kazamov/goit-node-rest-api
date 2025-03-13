import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sequelize.js';

import { ContactAttributes, ContactCreationAttributes } from '@/types/contact.js';

export class Contact extends Model<ContactAttributes, ContactCreationAttributes> {}

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

// await Contact.sync({ force: true });
