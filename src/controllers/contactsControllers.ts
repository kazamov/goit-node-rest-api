import { Request, Response } from 'express';

import HttpError from '@/helpers/HttpError.js';
import * as contactsService from '@/services/contactsServices.js';

export const getAllContacts = async (req: Request, res: Response) => {
    const contacts = await contactsService.listContacts();
    res.json(contacts);
};

export const getContactById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const contact = await contactsService.getContactById(id);

    if (!contact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(contact);
};

export const deleteContact = async (req: Request, res: Response) => {
    const { id } = req.params;

    const contact = await contactsService.removeContact(id);

    if (!contact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(contact);
};

export const createContact = async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;

    const newContact = await contactsService.addContact({ name, email, phone });

    res.status(201).json(newContact);
};

export const updateContact = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const updatedContact = await contactsService.updateContact(id, { name, email, phone });

    if (!updatedContact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(updatedContact);
};
