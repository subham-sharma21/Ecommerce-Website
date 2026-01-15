package com.echocart.backend.service;

import com.echocart.backend.entity.Order;
import com.echocart.backend.repository.OrderRepository;
import com.echocart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Order createOrder(Order order) {
        validateOrder(order);

        // Verify user exists
        if (!userRepository.existsById(order.getUserId())) {
            throw new RuntimeException("User not found with ID: " + order.getUserId());
        }

        order.setOrderDate(LocalDate.now());
        order.setStatus(Order.Status.PENDING);

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderDetails(Long orderId) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }

        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
    }

    @Override
    public Order updateOrderStatus(Long orderId, Order.Status status) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }

        Order existing = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        existing.setStatus(status);
        return orderRepository.save(existing);
    }

    private void validateOrder(Order order) {
        if (order.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total amount must be greater than 0");
        }
    }
}