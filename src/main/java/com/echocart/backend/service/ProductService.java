package com.echocart.backend.service;

import com.echocart.backend.entity.Product;
import java.util.List;

public interface ProductService {
    Product addProduct(Product product);
    Product updateProduct(Long productId, Product product);
    Product getProductDetails(Long productId);
    void deleteProduct(Long productId);
    List<Product> getAllProducts();
}
