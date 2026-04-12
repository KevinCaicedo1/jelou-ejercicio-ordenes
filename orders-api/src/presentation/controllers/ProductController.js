class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  create = async (req, res, next) => {
    try {
      const product = await this.productService.createProduct(req.body);
      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const product = await this.productService.updateProduct(Number(req.params.id), req.body);
      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const product = await this.productService.getProductById(Number(req.params.id));
      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.productService.searchProducts(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { ProductController };