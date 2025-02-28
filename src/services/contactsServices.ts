import { Contact } from '@/db/models/Contact.js';
import { ContactAttributes, contactSchema } from '@/schemas/contactsSchemas.js';

type ContactQuery = Partial<ContactAttributes>;

export async function listContacts(query: ContactQuery): Promise<ContactAttributes[]> {
    const contacts = await Contact.findAll({
        where: query,
    });
    return contacts.map((contact) => contactSchema.parse(contact.toJSON()));
}

export async function getContact(query: ContactQuery): Promise<ContactAttributes | null> {
    const contact = await Contact.findOne({ where: query });
    return contact ? contactSchema.parse(contact.toJSON()) : null;
}

export async function removeContact(
    query: Pick<ContactAttributes, 'id' | 'owner'>,
): Promise<number> {
    const numberOfDeletedRows = await Contact.destroy({ where: query });
    return numberOfDeletedRows;
}

export async function addContact(
    payload: Omit<ContactAttributes, 'id' | 'favorite'>,
): Promise<ContactAttributes> {
    const contact = await Contact.create({ ...payload, favorite: false });
    return contactSchema.parse(contact.toJSON());
}

export async function updateContact(
    query: Pick<ContactAttributes, 'id' | 'owner'>,
    { name, email, phone, favorite }: Partial<Omit<ContactAttributes, 'id' | 'owner'>>,
): Promise<ContactAttributes | null> {
    const contact = await Contact.findOne({ where: query });

    if (!contact) {
        return null;
    }

    const updatedContact = await contact.update(
        { name, email, phone, favorite },
        { returning: true },
    );
    return contactSchema.parse(updatedContact.toJSON());
}
