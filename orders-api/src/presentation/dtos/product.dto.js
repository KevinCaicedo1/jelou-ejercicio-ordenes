const { z } = require('zod');

const CreateProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(180),
  price_cents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0)
});

const UpdateProductSchema = z
  .object({
    price_cents: z.number().int().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional()
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  });

const SearchProductsSchema = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

module.exports = {
  CreateProductSchema,
  UpdateProductSchema,
  SearchProductsSchema
};