SET NAMES utf8mb4;

USE customers_db;

INSERT INTO customers (id, name, email, phone, is_deleted)
VALUES
  (1, 'ACME Corp', 'ops@acme.com', '+593999111111', 0),
  (2, 'Globex Corporation', 'purchases@globex.com', '+593999222222', 0),
  (3, 'Initech', 'buyer@initech.com', '+593999333333', 0)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  is_deleted = VALUES(is_deleted);

USE orders_db;

INSERT INTO products (id, sku, name, price_cents, stock, is_active)
VALUES
  (1, 'LAP-001', 'Laptop Pro 14', 129900, 15, 1),
  (2, 'MON-002', 'Monitor 27 4K', 153300, 20, 1),
  (3, 'KEY-003', 'Mechanical Keyboard', 45900, 50, 1),
  (4, 'MOU-004', 'Wireless Mouse', 25900, 80, 1),
  (5, 'DOC-005', 'USB-C Docking Station', 89900, 25, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  price_cents = VALUES(price_cents),
  stock = VALUES(stock),
  is_active = VALUES(is_active);

INSERT INTO orders (id, customer_id, status, total_cents, confirmed_at, canceled_at)
VALUES
  (1001, 1, 'CREATED', 305700, NULL, NULL),
  (1002, 2, 'CONFIRMED', 91700, CURRENT_TIMESTAMP, NULL)
ON DUPLICATE KEY UPDATE
  customer_id = VALUES(customer_id),
  status = VALUES(status),
  total_cents = VALUES(total_cents),
  confirmed_at = VALUES(confirmed_at),
  canceled_at = VALUES(canceled_at);

INSERT INTO order_items (id, order_id, product_id, qty, unit_price_cents, subtotal_cents)
VALUES
  (1, 1001, 1, 1, 129900, 129900),
  (2, 1001, 3, 2, 45900, 91800),
  (3, 1001, 4, 2, 25900, 51800),
  (4, 1002, 3, 1, 45900, 45900),
  (5, 1002, 4, 1, 25900, 25900),
  (6, 1002, 5, 1, 89900, 89900)
ON DUPLICATE KEY UPDATE
  qty = VALUES(qty),
  unit_price_cents = VALUES(unit_price_cents),
  subtotal_cents = VALUES(subtotal_cents);

INSERT INTO idempotency_keys (
  idempotency_key,
  target_type,
  target_id,
  status,
  response_body,
  expires_at
)
VALUES
  (
    'seed-confirm-1002',
    'ORDER_CONFIRM',
    1002,
    'SUCCESS',
    JSON_OBJECT(
      'success', true,
      'data', JSON_OBJECT(
        'order', JSON_OBJECT(
          'id', 1002,
          'status', 'CONFIRMED',
          'total_cents', 91700
        )
      )
    ),
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)
  )
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  response_body = VALUES(response_body),
  expires_at = VALUES(expires_at);