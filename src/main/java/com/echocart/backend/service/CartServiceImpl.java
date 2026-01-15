package com.echocart.backend.service;

import com.echocart.backend.entity.Cart;
import com.echocart.backend.entity.Product;
import com.echocart.backend.repository.CartRepository;
import com.echocart.backend.repository.UserRepository;
import com.echocart.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(CartRepository cartRepository, UserRepository userRepository,
                           ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Cart addToCart(Cart cart) {
        validateCart(cart);

        // Verify user exists
        if (!userRepository.existsById(cart.getUserId())) {
            throw new RuntimeException("User not found with ID: " + cart.getUserId());
        }

        // Verify product exists and check stock
        Optional<Product> productOpt = productRepository.findById(cart.getProductId());
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found with ID: " + cart.getProductId());
        }

        Product product = productOpt.get();
        if (product.getStockQuantity() < cart.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        // Check if item already exists in cart for this user and product
        List<Cart> existingCarts = cartRepository.findByUserId(cart.getUserId());
        for (Cart existingCart : existingCarts) {
            if (existingCart.getProductId().equals(cart.getProductId())) {
                existingCart.setQuantity(existingCart.getQuantity() + cart.getQuantity());
                return cartRepository.save(existingCart);
            }
        }

        return cartRepository.save(cart);
    }

    @Override
    public void removeFromCart(Long cartId) {
        if (cartId == null) {
            throw new IllegalArgumentException("Cart ID cannot be null");
        }

        if (!cartRepository.existsById(cartId)) {
            throw new RuntimeException("Cart item not found with ID: " + cartId);
        }

        cartRepository.deleteById(cartId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cart> getCartDetails(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        return cartRepository.findByUserId(userId);
    }

    private void validateCart(Cart cart) {
        if (cart.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (cart.getProductId() == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        if (cart.getQuantity() == null || cart.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
    }
}