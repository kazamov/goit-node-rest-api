import { Contact } from '@/db/models/Contact.js';
import { ContactAttributes, contactSchema } from '@/schemas/contactsSchemas.js';

export async function listContacts(): Promise<ContactAttributes[]> {
    const contacts = await Contact.findAll();
    return contacts.map((contact) => contactSchema.parse(contact.toJSON()));
}

export async function getContactById(contactId: string): Promise<ContactAttributes | null> {
    const contact = await Contact.findByPk(contactId);
    return contact ? contactSchema.parse(contact.toJSON()) : null;
}

export async function removeContact(contactId: string): Promise<string | null> {
    const numberOfDeletedRows = await Contact.destroy({ where: { id: contactId } });
    return numberOfDeletedRows > 0 ? contactId : null;
}

export async function addContact({
    name,
    email,
    phone,
}: Omit<ContactAttributes, 'id' | 'favorite'>): Promise<ContactAttributes> {
    const contact = await Contact.create({ name, email, phone, favorite: false });
    return contactSchema.parse(contact.toJSON());
}

export async function updateContact(
    contactId: string,
    { name, email, phone, favorite }: Partial<Omit<ContactAttributes, 'id'>>,
): Promise<ContactAttributes | null> {
    const contact = await Contact.findByPk(contactId);

    if (!contact) {
        return null;
    }

    const updatedContact = await contact.update(
        { name, email, phone, favorite },
        { returning: true },
    );
    return contactSchema.parse(updatedContact.toJSON());
}
