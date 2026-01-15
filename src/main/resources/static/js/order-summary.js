// Order Summary JavaScript

// Get cart data from localStorage
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const orderItemsContainer = document.getElementById('order-items');
const orderTotalElement = document.getElementById('order-total');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const proceedPaymentBtn = document.getElementById('proceed-payment-btn');
const orderSummarySection = document.getElementById('order-summary-section');
const orderConfirmedSection = document.getElementById('order-confirmed-section');
const paymentSuccessSection = document.getElementById('payment-success-section');

// Store order data
let currentOrderData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (cartItems.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    
    displayOrderSummary();
    setupEventListeners();
});

// Display order summary
function displayOrderSummary() {
    orderItemsContainer.innerHTML = '';
    let total = 0;
    
    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'row align-items-center mb-3 p-3 border rounded';
        orderItem.innerHTML = `
            <div class="col-md-2">
                <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="height: 80px; object-fit: cover;">
            </div>
            <div class="col-md-6">
                <h6 class="mb-1">${item.name}</h6>
                <p class="text-muted mb-1">Product ID: ${item.id}</p>
                <p class="text-muted mb-0">${item.description}</p>
            </div>
            <div class="col-md-2 text-center">
                <span class="badge bg-secondary">Qty: ${item.quantity}</span>
            </div>
            <div class="col-md-2 text-end">
                <div class="fw-bold">₹${item.price.toLocaleString()}</div>
                <div class="text-success">₹${subtotal.toLocaleString()}</div>
            </div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    orderTotalElement.textContent = `₹${total.toLocaleString()}`;
}

// Setup event listeners
function setupEventListeners() {
    confirmOrderBtn.addEventListener('click', confirmOrder);
    proceedPaymentBtn.addEventListener('click', proceedToPayment);
}

// Confirm order
async function confirmOrder() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login to place order');
        window.location.href = 'index.html';
        return;
    }
    
    // Show loading state
    confirmOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    confirmOrderBtn.disabled = true;
    
    const orderData = {
        userId: parseInt(userId),
        items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    try {
        const response = await fetch('http://localhost:8081/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showOrderConfirmed(result);
        } else {
            throw new Error('Failed to create order');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        // Demo success for testing
        const demoResult = {
            userId: userId,
            orderId: Math.floor(Math.random() * 10000) + 1000,
            totalAmount: orderData.totalAmount,
            orderDate: new Date().toISOString(),
            orderStatus: 'PENDING',
            paymentStatus: 'PENDING'
        };
        showOrderConfirmed(demoResult);
    }
}

// Show order confirmed
function showOrderConfirmed(orderResult) {
    currentOrderData = orderResult;
    
    // Hide order summary and show confirmed section
    orderSummarySection.classList.add('d-none');
    orderConfirmedSection.classList.remove('d-none');
    
    // Populate order details
    document.getElementById('confirmed-user-id').textContent = orderResult.userId;
    document.getElementById('confirmed-order-id').textContent = orderResult.orderId;
    document.getElementById('confirmed-total-amount').textContent = `₹${orderResult.totalAmount.toLocaleString()}`;
    document.getElementById('confirmed-order-date').textContent = new Date(orderResult.orderDate).toLocaleDateString();
    document.getElementById('confirmed-order-status').innerHTML = `<span class="badge bg-warning">${orderResult.orderStatus}</span>`;
    document.getElementById('confirmed-payment-status').innerHTML = `<span class="badge bg-warning">${orderResult.paymentStatus}</span>`;
    
    // Show order items summary
    const confirmedItemsContainer = document.getElementById('confirmed-order-items');
    confirmedItemsContainer.innerHTML = '';
    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-2 pb-2 border-bottom';
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
            </div>
        `;
        confirmedItemsContainer.appendChild(itemDiv);
    });
}

// Proceed to payment
async function proceedToPayment() {
    proceedPaymentBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Payment...';
    proceedPaymentBtn.disabled = true;
    
    try {
        const response = await fetch(`http://localhost:8081/api/orders/${currentOrderData.orderId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentMethod: 'card' })
        });
        
        if (response.ok) {
            const result = await response.json();
            showPaymentSuccess(result);
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        // Demo payment success
        const paymentResult = {
            ...currentOrderData,
            orderStatus: 'PENDING',
            paymentStatus: 'COMPLETED'
        };
        showPaymentSuccess(paymentResult);
    }
    
    // Clear cart after payment
    localStorage.removeItem('cart');
}

// Show payment success
function showPaymentSuccess(paymentResult) {
    // Hide confirmed section and show success section
    orderConfirmedSection.classList.add('d-none');
    paymentSuccessSection.classList.remove('d-none');
    
    // Populate final details
    document.getElementById('final-user-id').textContent = paymentResult.userId;
    document.getElementById('final-order-id').textContent = paymentResult.orderId;
    document.getElementById('final-total-amount').textContent = `₹${paymentResult.totalAmount.toLocaleString()}`;
    document.getElementById('final-order-date').textContent = new Date(paymentResult.orderDate).toLocaleDateString();
    document.getElementById('final-order-status').innerHTML = `<span class="badge bg-warning">${paymentResult.orderStatus}</span>`;
    document.getElementById('final-payment-status').innerHTML = `<span class="badge bg-success">${paymentResult.paymentStatus}</span>`;
}