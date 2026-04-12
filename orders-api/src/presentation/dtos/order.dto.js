const { z } = require('zod');

const OrderItemSchema = z.object({
  product_id: z.number().int().positive(),
  qty: z.number().int().positive()
});

const CreateOrderSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(OrderItemSchema).min(1)
});

const ConfirmOrderSchema = z.object({});

const SearchOrdersSchema = z.object({
  status: z.enum(['CREATED', 'CONFIRMED', 'CANCELED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

module.exports = {
  OrderItemSchema,
  CreateOrderSchema,
  ConfirmOrderSchema,
  SearchOrdersSchema
};