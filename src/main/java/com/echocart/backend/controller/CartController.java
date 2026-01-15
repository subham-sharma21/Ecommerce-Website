package com.echocart.backend.controller;

import com.echocart.backend.entity.Cart;
import com.echocart.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")

public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Cart cart) {
        try {
            Cart saved = cartService.addToCart(cart);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product added to cart", "cart", saved));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long cartId) {
        try {
            cartService.removeFromCart(cartId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product removed from cart"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getCartDetails(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartDetails(userId);
        return ResponseEntity.ok(Map.of("success", true, "cartItems", cartItems));
    }
}
