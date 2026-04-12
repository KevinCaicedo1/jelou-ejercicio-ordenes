class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  create = async (req, res, next) => {
    try {
      const order = await this.orderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const order = await this.orderService.getOrderById(Number(req.params.id));
      return res.status(200).json(order);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.orderService.searchOrders(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  confirm = async (req, res, next) => {
    try {
      const idempotencyKey = req.headers['x-idempotency-key'];
      const order = await this.orderService.confirmOrder(Number(req.params.id), idempotencyKey);
      return res.status(200).json(order);
    } catch (error) {
      return next(error);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const order = await this.orderService.cancelOrder(Number(req.params.id));
      return res.status(200).json(order);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { OrderController };