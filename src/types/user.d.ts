import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export interface UserAttributes {
    id?: CreationOptional<string>;
    password: string;
    email: string;
    subscription: SubscriptionType;
    token: string | null;
    avatarURL: string | null;
    verify: boolean;
    verificationToken: string | null;
}

export type UserCreationAttributes = InferCreationAttributes<User>;

export declare class User extends Model<InferAttributes<User>, UserCreationAttributes> {}
