package com.echocart.backend.service;

import com.echocart.backend.entity.Payment;
import com.echocart.backend.repository.PaymentRepository;
import com.echocart.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public Payment processPayment(Payment payment) {
        validatePayment(payment);

        // Verify order exists
        if (!orderRepository.existsById(payment.getOrderId())) {
            throw new RuntimeException("Order not found with ID: " + payment.getOrderId());
        }

        // Simulate payment gateway processing
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentStatus(Payment.PaymentStatus.COMPLETED);

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentStatus(Long paymentId) {
        if (paymentId == null) {
            throw new IllegalArgumentException("Payment ID cannot be null");
        }

        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
    }

    private void validatePayment(Payment payment) {
        if (payment.getOrderId() == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        if (payment.getAmount() == null || payment.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than 0");
        }
    }
}
