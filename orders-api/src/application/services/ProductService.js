const { ConflictError, NotFoundError } = require('../../shared/errors/AppError');
const { encodeCursor } = require('../../shared/utils/cursorPagination');

class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async createProduct(payload) {
    try {
      return await this.productRepository.create(payload);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('SKU already exists');
      }
      throw error;
    }
  }

  async updateProduct(id, payload) {
    const product = await this.productRepository.updateById(id, payload);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async getProductById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async searchProducts(filters) {
    const products = await this.productRepository.findManyActive(filters);
    const nextCursor = products.length === filters.limit ? encodeCursor(products[products.length - 1].id) : null;
    return {
      data: products,
      nextCursor,
      limit: filters.limit
    };
  }
}

module.exports = { ProductService };