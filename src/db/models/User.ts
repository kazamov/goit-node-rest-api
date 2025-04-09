import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../sequelize.js';

import { Subscription, subscriptionList } from '@/constants/auth.js';
import type { UserAttributes, UserCreationAttributes } from '@/types/user.js';

export class User extends Model<UserAttributes, UserCreationAttributes> {}

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
        verify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationToken: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
    },
    { sequelize },
);

// await User.sync({ force: true });
