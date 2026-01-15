package com.echocart.backend.controller;

import com.echocart.backend.entity.User;
import com.echocart.backend.entity.Product;
import com.echocart.backend.entity.Order;
import com.echocart.backend.service.UserService;
import com.echocart.backend.service.ProductService;
import com.echocart.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
//class level
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;

    public UserController(UserService userService, ProductService productService, OrderService orderService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
    }

    // ==================== CUSTOMER & ADMIN COMMON ENDPOINTS ====================
 //method leve;l
    // REGISTER CUSTOMER
    @PostMapping("/register/customer")
    public ResponseEntity<Map<String, Object>> registerCustomer(@Valid @RequestBody Map<String, String> payload) {
        try {
            User user = new User();
            user.setUsername(payload.get("name"));
            user.setEmail(payload.get("email"));
            user.setPassword(payload.get("password"));
            user.setRole(User.Role.CUSTOMER);

            User savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Registration successful!",
                            "userId", savedUser.getUserId(),
                            "role", savedUser.getRole()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // REGISTER ADMIN
    @PostMapping("/register/admin")
    public ResponseEntity<Map<String, Object>> registerAdmin(@Valid @RequestBody Map<String, String> payload) {
        try {
            // Admin key protection
            String adminKey = payload.get("adminKey");
            if (!"ADMIN".equals(adminKey)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Invalid admin key"));
            }

            User admin = new User();
            admin.setUsername(payload.get("name"));
            admin.setEmail(payload.get("email"));
            admin.setPassword(payload.get("password"));
            admin.setRole(User.Role.ADMIN);

            User savedAdmin = userService.registerUser(admin);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Admin registered successfully!",
                            "userId", savedAdmin.getUserId(),
                            "role", savedAdmin.getRole()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // LOGIN (Works for both Customer & Admin)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody Map<String, String> credentials) {
        try {
            String emailOrUsername = credentials.get("email");
            String password = credentials.get("password");

            User user = userService.loginUser(emailOrUsername, password);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful!",
                    "userId", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "isAdmin", user.getRole() == User.Role.ADMIN
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        }
    }

    // GET USER PROFILE
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userService.getUserProfile(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", Map.of(
                            "userId", user.getUserId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "role", user.getRole()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ==================== ADMIN ONLY ENDPOINTS ====================

    // Helper method to verify admin access
    private boolean isAdmin(Long userId) {
        try {
            User user = userService.getUserProfile(userId);
            return user.getRole() == User.Role.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }


    @PutMapping("/{userId}/update")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, String> updates) {
        try {
            User user = userService.getUserProfile(userId);
            if (updates.containsKey("username")) {
                user.setUsername(updates.get("username"));
            }
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email"));
            }
            if (updates.containsKey("password")) {
                user.setPassword(updates.get("password"));
            }
            User updatedUser = userService.updateUser(user); // Using proper updateUser method
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", Map.of(
                            "userId", updatedUser.getUserId(),
                            "username", updatedUser.getUsername(),
                            "email", updatedUser.getEmail(),
                            "role", updatedUser.getRole()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ADMIN DASHBOARD
    @GetMapping("/admin/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard(@RequestParam Long adminUserId) {
        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            Map<String, Object> dashboard = userService.getAdminDashboard();
            return ResponseEntity.ok(Map.of("success", true, "dashboard", dashboard));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to load dashboard"));
        }
    }

    // GET ALL USERS (Admin Only)
    @GetMapping("/admin/allusers")
    public ResponseEntity<Map<String, Object>> getAllUsers(@RequestParam Long adminUserId) {
        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(Map.of("success", true, "users", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to get users"));
        }
    }

    // GET ALL PRODUCTS (Admin Only)
    @GetMapping("/admin/all-products")
    public ResponseEntity<Map<String, Object>> getAllProducts(@RequestParam Long adminUserId) {
        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            List<Product> products = productService.getAllProducts();
            return ResponseEntity.ok(Map.of("success", true, "products", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to get products"));
        }
    }

    // GET ALL ORDERS (Admin Only)
    @GetMapping("/admin/all-orders")
    public ResponseEntity<Map<String, Object>> getAllOrders(@RequestParam Long adminUserId) {
        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            List<Order> orders = userService.getAllOrders();
            return ResponseEntity.ok(Map.of("success", true, "orders", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to get orders"));
        }
    }

    // UPDATE USER ROLE (Admin Only)
    @PutMapping("/admin/update-role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @RequestParam Long adminUserId,
            @RequestParam Long targetUserId,
            @RequestParam String newRole) {

        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            User.Role role = User.Role.valueOf(newRole.toUpperCase());
            User updatedUser = userService.updateUserRole(targetUserId, role);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User role updated successfully",
                    "user", updatedUser
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Invalid role: " + newRole));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // UPDATE ORDER STATUS (Admin Only)
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Long adminUserId,
            @RequestParam String status) {

        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            Order.Status orderStatus = Order.Status.valueOf(status.toUpperCase());
            Order updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order status updated successfully",
                    "order", updatedOrder
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // DELETE USER (Admin Only)
    @DeleteMapping("/admin/delete-user/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Long userId,
            @RequestParam Long adminUserId) {

        if (!isAdmin(adminUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}