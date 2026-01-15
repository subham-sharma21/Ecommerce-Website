package com.echocart.backend.service;

import com.echocart.backend.entity.Order;

public interface OrderService {
    Order createOrder(Order order);
    Order getOrderDetails(Long orderId);
    Order updateOrderStatus(Long orderId, Order.Status status);
}
