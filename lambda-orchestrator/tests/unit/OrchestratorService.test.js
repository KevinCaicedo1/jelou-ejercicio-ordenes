const { OrchestratorService } = require('../../src/services/OrchestratorService');
const {
  NotFoundError,
  UnprocessableError,
  ServiceUnavailableError,
  ConflictError
} = require('../../src/shared/errors/AppError');

describe('OrchestratorService', () => {
  const payload = {
    customer_id: 1,
    items: [{ product_id: 2, qty: 3 }],
    idempotency_key: 'abc-123',
    correlation_id: 'req-789'
  };

  test('flujo exitoso completo', async () => {
    const customer = {
      id: 1,
      name: 'ACME',
      email: 'ops@acme.com',
      phone: '999999'
    };
    const createdOrder = {
      id: 101,
      status: 'CREATED',
      total_cents: 459900,
      items: [{ product_id: 2, qty: 3, unit_price_cents: 153300, subtotal_cents: 459900 }]
    };
    const confirmedOrder = {
      ...createdOrder,
      status: 'CONFIRMED'
    };

    const customersClient = {
      getCustomer: jest.fn().mockResolvedValue(customer)
    };
    const ordersClient = {
      createOrder: jest.fn().mockResolvedValue(createdOrder),
      confirmOrder: jest.fn().mockResolvedValue(confirmedOrder)
    };

    const service = new OrchestratorService({ customersClient, ordersClient });

    const result = await service.execute(payload);

    expect(customersClient.getCustomer).toHaveBeenCalledWith(payload.customer_id);
    expect(ordersClient.createOrder).toHaveBeenCalledWith(payload.customer_id, payload.items);
    expect(ordersClient.confirmOrder).toHaveBeenCalledWith(createdOrder.id, payload.idempotency_key);
    expect(result).toEqual({
      customer,
      order: expect.objectContaining({ status: 'CONFIRMED' })
    });
  });

  test('cliente no encontrado', async () => {
    const customersClient = {
      getCustomer: jest.fn().mockRejectedValue(
        new NotFoundError('Customer with id 1 not found', 'validate_customer')
      )
    };
    const ordersClient = {
      createOrder: jest.fn(),
      confirmOrder: jest.fn()
    };

    const service = new OrchestratorService({ customersClient, ordersClient });

    await expect(service.execute(payload)).rejects.toMatchObject({
      statusCode: 404,
      step: 'validate_customer'
    });
  });

  test('stock insuficiente', async () => {
    const customersClient = {
      getCustomer: jest.fn().mockResolvedValue({ id: 1 })
    };
    const ordersClient = {
      createOrder: jest.fn().mockRejectedValue(
        new UnprocessableError('Insufficient stock', 'create_order')
      ),
      confirmOrder: jest.fn()
    };

    const service = new OrchestratorService({ customersClient, ordersClient });

    await expect(service.execute(payload)).rejects.toMatchObject({
      statusCode: 422,
      step: 'create_order'
    });
  });

  test('customers api no disponible', async () => {
    const customersClient = {
      getCustomer: jest.fn().mockRejectedValue(
        new ServiceUnavailableError('Customers API unavailable', 'validate_customer')
      )
    };
    const ordersClient = {
      createOrder: jest.fn(),
      confirmOrder: jest.fn()
    };

    const service = new OrchestratorService({ customersClient, ordersClient });

    await expect(service.execute(payload)).rejects.toMatchObject({
      statusCode: 503,
      step: 'validate_customer'
    });
  });

  test('idempotencia en confirmacion', async () => {
    const customersClient = {
      getCustomer: jest.fn().mockResolvedValue({ id: 1 })
    };
    const ordersClient = {
      createOrder: jest.fn().mockResolvedValue({ id: 101 }),
      confirmOrder: jest.fn().mockRejectedValue(
        new ConflictError('Order already confirmed', 'confirm_order')
      )
    };

    const service = new OrchestratorService({ customersClient, ordersClient });

    await expect(service.execute(payload)).rejects.toMatchObject({
      statusCode: 409,
      step: 'confirm_order'
    });
  });
});
