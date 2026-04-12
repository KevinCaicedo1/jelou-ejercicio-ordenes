const { z } = require('zod');
const { decodeCursor } = require('../../shared/utils/cursorPagination');

const CreateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(1).max(50)
});

const UpdateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    phone: z.string().trim().min(1).max(50).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });

const CustomerIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const SearchCustomersSchema = z.object({
  search: z.string().trim().optional().default(''),
  cursor: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return null;
      }

      const decoded = decodeCursor(value);
      if (decoded === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid cursor'
        });
      }

      return decoded;
    }),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const CustomerResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  created_at: z.date().or(z.string())
});

module.exports = {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  SearchCustomersSchema,
  CustomerResponseSchema,
  CustomerIdParamSchema
};
