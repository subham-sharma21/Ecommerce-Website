// Customer Panel JavaScript

// Check authentication
if (!localStorage.getItem('userId') || localStorage.getItem('userMode') !== 'customer') {
    window.location.href = 'index.html';
}

// Sample product data (simulating API response)
const sampleProducts = [
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 149.99,
        description: 'High-fidelity sound and noise cancellation.',
        image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 2,
        name: 'Smartwatch Pro',
        price: 299.99,
        description: 'Track your fitness and stay connected on the go.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 3,
        name: 'Ultra-Slim Laptop',
        price: 1299.00,
        description: 'Powerful performance in a sleek, portable design.',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 4,
        name: '4K Camera Drone',
        price: 499.50,
        description: 'Capture stunning aerial footage with ease.',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=400&auto=format&fit=crop'
    }
];

// DOM elements
const productsContainer = document.getElementById('products-container');
const loadingSpinner = document.getElementById('loading-spinner');
const alertContainer = document.getElementById('alert-container');
const logoutBtn = document.getElementById('logout-btn');

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupOrdersModal();
});

// Setup orders modal
function setupOrdersModal() {
    const ordersModal = document.getElementById('ordersModal');
    ordersModal.addEventListener('show.bs.modal', loadUserOrders);
}

// Logout functionality
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

// Load products function
async function loadProducts() {
    showLoading(true);
    
    // Simulate API call
    setTimeout(async () => {
        // Use the API_BASE for consistency
        const API_BASE = 'http://localhost:8081/api';
        await fetch(`${API_BASE}/products`)
        .then(res => res.json())
        .then(data => {
            displayProducts(data.products || sampleProducts);
        })
        .catch(() => {
            // Use sample data if API fails
            displayProducts(sampleProducts);
        })
        .finally(() => {
            showLoading(false);
        });
    }, 500);
}

// Display products function
function displayProducts(products) {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col';
    
    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted flex-grow-1">${product.description}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="product-price">₹${product.price.toFixed(2)}</span>
                    <button class="btn btn-custom btn-sm" onclick="addToCart(${product.id}, '${product.name}', 'PRD${product.id}', '${product.description}', ${product.price}, '${product.image}')">
                        <i class="bi bi-cart-plus me-1"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Add to cart function - integrated with CartManager
function addToCart(id, name, code, description, price, image) {
    if (window.cartManager) {
        window.cartManager.addToCart(id, name, code, description, price, image);
    } else {
        showAlert('Cart system not loaded', 'danger');
    }
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

// Load user orders
async function loadUserOrders() {
    const userId = localStorage.getItem('userId');
    const ordersLoading = document.getElementById('orders-loading');
    const ordersEmpty = document.getElementById('orders-empty');
    const ordersContent = document.getElementById('orders-content');
    
    // Show loading state
    ordersLoading.style.display = 'block';
    ordersEmpty.style.display = 'none';
    ordersContent.style.display = 'none';
    
    try {
        // Use the API_BASE from main.js for consistency
        const API_BASE = 'http://localhost:8081/api';
        const response = await fetch(`${API_BASE}/orders/user/${userId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.orders && data.orders.length > 0) {
                displayOrders(data.orders);
            } else {
                showEmptyOrders();
            }
        } else {
            throw new Error('Failed to load orders');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Failed to load orders. Please check if the backend server is running.', 'danger');
        showEmptyOrders();
    } finally {
        ordersLoading.style.display = 'none';
    }
}

// Display orders
function displayOrders(orders) {
    const ordersContent = document.getElementById('orders-content');
    const ordersTableBody = document.getElementById('orders-table-body');
    
    ordersTableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const statusBadge = getOrderStatusBadge(order.status);
        
        row.innerHTML = `
            <td>#${order.orderId}</td>
            <td>₹${order.totalAmount.toFixed(2)}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>${statusBadge}</td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    ordersContent.style.display = 'block';
}

// Show empty orders state
function showEmptyOrders() {
    document.getElementById('orders-empty').style.display = 'block';
}

// Get order status badge
function getOrderStatusBadge(status) {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'pending') {
        return `<span class="badge bg-warning">${status}</span>`;
    } else if (statusLower === 'shipped') {
        return `<span class="badge bg-primary">${status}</span>`;
    } else if (statusLower === 'delivered') {
        return `<span class="badge bg-success">${status}</span>`;
    } else if (statusLower === 'cancelled') {
        return `<span class="badge bg-danger">${status}</span>`;
    } else {
        return `<span class="badge bg-secondary">${status}</span>`;
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}