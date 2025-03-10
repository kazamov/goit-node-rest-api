import { Request, Response } from 'express';

import HttpError from '@/helpers/HttpError.js';
import { UserSchemaAttributes } from '@/schemas/authSchemas.js';
import { contactsQuerySchema } from '@/schemas/contactsSchemas.js';
import * as contactsService from '@/services/contactsServices.js';

export const getAllContacts = async (req: Request, res: Response) => {
    const { id: owner } = req.user as UserSchemaAttributes;
    const { favorite, page, limit } = contactsQuerySchema.parse(req.query);

    const contacts = await contactsService.listContacts({
        owner,
        ...(typeof favorite === 'boolean' && { favorite }),
        page,
        limit,
    });

    res.json(contacts);
};

export const getContact = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: owner } = req.user as UserSchemaAttributes;

    const contact = await contactsService.getContact({ id, owner });

    if (!contact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(contact);
};

export const deleteContact = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: owner } = req.user as UserSchemaAttributes;

    const contact = await contactsService.removeContact({ id, owner });

    if (!contact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json({ success: true });
};

export const createContact = async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    const { id: owner } = req.user as UserSchemaAttributes;

    const newContact = await contactsService.addContact({ name, email, phone, owner });

    res.status(201).json(newContact);
};

export const updateContact = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const { id: owner } = req.user as UserSchemaAttributes;

    const updatedContact = await contactsService.updateContact(
        { id, owner },
        { name, email, phone },
    );

    if (!updatedContact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(updatedContact);
};

export const updateStatusContact = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { favorite } = req.body;
    const { id: owner } = req.user as UserSchemaAttributes;

    const updatedContact = await contactsService.updateContact({ id, owner }, { favorite });

    if (!updatedContact) {
        throw new HttpError('Contact not found', 404);
    }

    res.json(updatedContact);
};
