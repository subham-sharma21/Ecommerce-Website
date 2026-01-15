package com.echocart.backend.service;

import com.echocart.backend.entity.Payment;

public interface PaymentService {
    Payment processPayment(Payment payment);
    Payment getPaymentStatus(Long paymentId);
}
