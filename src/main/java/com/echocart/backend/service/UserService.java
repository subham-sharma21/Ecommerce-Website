package com.echocart.backend.service;

import com.echocart.backend.entity.User;
import com.echocart.backend.entity.Order;
import java.util.List;
import java.util.Map;

public interface UserService {
    // Customer & Admin Common Methods
    User registerUser(User user);
    User updateUser(User user);
    User loginUser(String identifier, String password);
    User getUserProfile(Long userId);

    // Admin Only Methods
    List<User> getAllUsers();
    List<Order> getAllOrders();
    Map<String, Object> getAdminDashboard();
    User updateUserRole(Long userId, User.Role newRole);
    void deleteUser(Long userId);
    List<User> getUsersByRole(User.Role role);
}