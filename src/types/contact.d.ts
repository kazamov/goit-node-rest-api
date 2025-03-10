import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export interface ContactAttributes {
    id?: CreationOptional<string>;
    name: string;
    email: string;
    phone: string;
    favorite: boolean;
    owner: string;
}

export type ContactCreationAttributes = InferCreationAttributes<Contact>;

export declare class Contact extends Model<InferAttributes<Contact>, ContactCreationAttributes> {}
