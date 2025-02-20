import express from 'express';

import {
    createContact,
    deleteContact,
    getAllContacts,
    getContactById,
    updateContact,
    updateStatusContact,
} from '@/controllers/contactsControllers.js';
import { catchErrors } from '@/decorators/catchErrors.js';
import { validateBody } from '@/decorators/validateBody.js';
import {
    createContactSchema,
    updateContactSchema,
    updateStatusContactSchema,
} from '@/schemas/contactsSchemas.js';

const contactsRouter = express.Router();

contactsRouter.get('/', catchErrors(getAllContacts));

contactsRouter.get('/:id', catchErrors(getContactById));

contactsRouter.delete('/:id', catchErrors(deleteContact));

contactsRouter.post('/', validateBody(createContactSchema), catchErrors(createContact));

contactsRouter.put('/:id', validateBody(updateContactSchema), catchErrors(updateContact));

contactsRouter.patch(
    '/:id/favorite',
    validateBody(updateStatusContactSchema),
    catchErrors(updateStatusContact),
);

export default contactsRouter;
