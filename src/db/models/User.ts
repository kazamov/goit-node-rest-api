import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

import { Subscription, subscriptionList, SubscriptionType } from '@/constants/auth.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id?: CreationOptional<string>;
    password: string;
    email: string;
    subscription: SubscriptionType;
    token: string | null;
    avatarURL: string | null;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        subscription: {
            type: DataTypes.ENUM,
            values: subscriptionList,
            defaultValue: Subscription.STARTER,
        },
        token: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        avatarURL: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
    },
    { sequelize },
);
