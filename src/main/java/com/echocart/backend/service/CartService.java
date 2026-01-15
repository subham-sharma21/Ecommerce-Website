package com.echocart.backend.service;

import com.echocart.backend.entity.Cart;
import java.util.List;

public interface CartService {
    Cart addToCart(Cart cart);
    void removeFromCart(Long cartId);
    List<Cart> getCartDetails(Long userId);
}
