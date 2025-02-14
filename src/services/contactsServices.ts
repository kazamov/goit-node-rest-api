import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

import { Contact } from '@/schemas/contactsSchemas.js';

const contactsPath = resolve('db/contacts.json');
console.log('Database file path:', contactsPath);

export async function listContacts(): Promise<Contact[]> {
    const fileContent = await readFile(contactsPath, { encoding: 'utf-8' });
    return JSON.parse(fileContent);
}

export async function getContactById(contactId: string): Promise<Contact | null> {
    const contacts = await listContacts();
    return contacts.find(({ id }) => id === contactId) ?? null;
}

export async function removeContact(contactId: string): Promise<Contact | null> {
    const contacts = await listContacts();
    const idx = contacts.findIndex(({ id }) => id === contactId);
    if (idx === -1) {
        return null;
    }
    const [removedContact] = contacts.splice(idx, 1);
    await writeFile(contactsPath, JSON.stringify(contacts, null, 4));
    return removedContact as Contact;
}

export async function addContact({ name, email, phone }: Omit<Contact, 'id'>): Promise<Contact> {
    const contacts = await listContacts();
    const newContact = { id: uuidv4(), name, email, phone };
    contacts.push(newContact);
    await writeFile(contactsPath, JSON.stringify(contacts, null, 4));
    return newContact;
}

export async function updateContact(
    contactId: string,
    { name, email, phone }: Partial<Omit<Contact, 'id'>>,
): Promise<Contact | null> {
    const contacts = await listContacts();
    const idx = contacts.findIndex(({ id }) => id === contactId);
    if (idx === -1) {
        return null;
    }
    const currentContact = contacts[idx];
    const updatedContact = {
        ...currentContact,
        name: name ?? currentContact.name,
        email: email ?? currentContact.email,
        phone: phone ?? currentContact.phone,
    };
    contacts[idx] = updatedContact;
    await writeFile(contactsPath, JSON.stringify(contacts, null, 4));
    return updatedContact;
}
