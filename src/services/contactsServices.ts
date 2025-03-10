import { Contact } from '@/db/models/Contact.js';
import { contactSchema, ContactSchemaAttributes } from '@/schemas/contactsSchemas.js';

type ContactQuery = Partial<ContactSchemaAttributes>;

interface ListContactsOptions extends ContactQuery {
    page?: number;
    limit?: number;
}

export async function listContacts({
    page,
    limit,
    ...query
}: ListContactsOptions): Promise<ContactSchemaAttributes[]> {
    const offset = page && limit ? (page - 1) * limit : undefined;

    const contacts = await Contact.findAll({
        where: query,
        ...(limit && { limit }),
        ...(offset && { offset }),
    });
    return contacts.map((contact) => contactSchema.parse(contact.toJSON()));
}

export async function getContact(query: ContactQuery): Promise<ContactSchemaAttributes | null> {
    const contact = await Contact.findOne({ where: query });
    return contact ? contactSchema.parse(contact.toJSON()) : null;
}

export async function removeContact(
    query: Pick<ContactSchemaAttributes, 'id' | 'owner'>,
): Promise<number> {
    const numberOfDeletedRows = await Contact.destroy({ where: query });
    return numberOfDeletedRows;
}

export async function addContact(
    payload: Omit<ContactSchemaAttributes, 'id' | 'favorite'>,
): Promise<ContactSchemaAttributes> {
    const contact = await Contact.create({ ...payload, favorite: false });
    return contactSchema.parse(contact.toJSON());
}

export async function updateContact(
    query: Pick<ContactSchemaAttributes, 'id' | 'owner'>,
    { name, email, phone, favorite }: Partial<Omit<ContactSchemaAttributes, 'id' | 'owner'>>,
): Promise<ContactSchemaAttributes | null> {
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
