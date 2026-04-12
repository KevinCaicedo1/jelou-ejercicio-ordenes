class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  createCustomer = async (req, res, next) => {
    try {
      const customer = await this.customerService.createCustomer(req.body);
      return res.status(201).json(customer);
    } catch (error) {
      return next(error);
    }
  };

  getCustomerById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const customer = await this.customerService.getCustomerById(id);
      return res.status(200).json(customer);
    } catch (error) {
      return next(error);
    }
  };

  searchCustomers = async (req, res, next) => {
    try {
      const result = await this.customerService.searchCustomers(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  updateCustomer = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const customer = await this.customerService.updateCustomer(id, req.body);
      return res.status(200).json(customer);
    } catch (error) {
      return next(error);
    }
  };

  deleteCustomer = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await this.customerService.deleteCustomer(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { CustomerController };
