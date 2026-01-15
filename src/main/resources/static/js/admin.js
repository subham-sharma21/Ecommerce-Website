// Admin Panel JavaScript

// Check authentication
if (!localStorage.getItem('userId') || localStorage.getItem('userMode') !== 'admin') {
    window.location.href = 'index.html';
}

// Sample product data (simulating API response)
let products = [
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
const addProductForm = document.getElementById('add-product-form');
const editProductForm = document.getElementById('edit-product-form');
const editUserForm = document.getElementById('edit-user-form');

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupTabs();
});

// Tab functionality
function setupTabs() {
    const usersTabBtn = document.getElementById('users-tab-btn');
    const ordersTabBtn = document.getElementById('orders-tab-btn');
    const productsTabBtn = document.getElementById('products-tab-btn');
    const usersSection = document.getElementById('users-section');
    const ordersSection = document.getElementById('orders-section');
    const productsSection = document.getElementById('products-section');
    
    usersTabBtn.addEventListener('click', () => {
        setActiveTab(usersTabBtn, [ordersTabBtn, productsTabBtn]);
        showSection(usersSection, [ordersSection, productsSection]);
        loadUsers();
    });
    
    ordersTabBtn.addEventListener('click', () => {
        setActiveTab(ordersTabBtn, [usersTabBtn, productsTabBtn]);
        showSection(ordersSection, [usersSection, productsSection]);
        loadOrders();
    });
    
    productsTabBtn.addEventListener('click', () => {
        setActiveTab(productsTabBtn, [usersTabBtn, ordersTabBtn]);
        showSection(productsSection, [usersSection, ordersSection]);
    });
}

function setActiveTab(activeBtn, inactiveBtns) {
    activeBtn.classList.remove('btn-outline-primary');
    activeBtn.classList.add('btn-custom');
    inactiveBtns.forEach(btn => {
        btn.classList.remove('btn-custom');
        btn.classList.add('btn-outline-primary');
    });
}

function showSection(activeSection, inactiveSections) {
    activeSection.style.display = 'block';
    inactiveSections.forEach(section => {
        section.style.display = 'none';
    });
}

// Load users function
async function loadUsers() {
    showLoading(true);
    const localUserId = localStorage.getItem('userId');
    try {
        const response = await fetch('http://localhost:8081/api/users/admin/allusers?adminUserId=' + localUserId);
        if (response.ok) {
            const data = await response.json();
            console.log('Users loaded:', data);
            displayUsers(data.users);
        } else {
            console.error('Failed to load users:', response.status);
            // Demo data if API fails
            const demoUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    // password: 'password123',
                    isAdmin: false
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    // password: 'admin456',
                    isAdmin: true
                }
            ];
            displayUsers(demoUsers);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        // Demo data for testing
        const demoUsers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                // password: 'password123',
                isAdmin: false
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                // password: 'admin456',
                isAdmin: true
            }
        ];
        displayUsers(demoUsers);
    } finally {
        showLoading(false);
    }
}

// Display users function
function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name || user.username}</td>
            <td>${user.email}</td>
            <td>
                <select class="form-select form-select-sm" onchange="updateUserRole(${user.id}, this.value)" style="width: 120px;">
                    <option value="customer" ${!user.isAdmin ? 'selected' : ''}>Customer</option>
                    <option value="admin" ${user.isAdmin ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="editUser(${user.id})" title="Edit User">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})" title="Delete User">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle password visibility
function togglePassword(userId) {
    const hiddenSpan = document.getElementById(`pwd-${userId}`);
    const visibleSpan = document.getElementById(`pwd-show-${userId}`);
    const eyeIcon = document.getElementById(`eye-${userId}`);
    
    if (hiddenSpan.classList.contains('d-none')) {
        hiddenSpan.classList.remove('d-none');
        visibleSpan.classList.add('d-none');
        eyeIcon.classList.remove('bi-eye-slash');
        eyeIcon.classList.add('bi-eye');
    } else {
        hiddenSpan.classList.add('d-none');
        visibleSpan.classList.remove('d-none');
        eyeIcon.classList.remove('bi-eye');
        eyeIcon.classList.add('bi-eye-slash');
    }
}

// Logout functionality
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

// Add product form handler
addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        categoryId: parseInt(document.getElementById('productCategory').value),
        stockQuantity: parseInt(document.getElementById('productStock').value) || 100,
        imageUrl : document.getElementById('productImage').value || ""
    };
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.categoryId) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }
    
    addProduct(productData);
});

// Edit product form handler
// Edit product form handler
editProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        // Change 'id' to 'productId' to match the update function's expectation
        // productId: parseInt(document.getElementById('editProductId').value), 
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        categoryId: parseInt(document.getElementById('editProductCategory').value),
        stockQuantity: parseInt(document.getElementById('editProductStock').value) || 100,
        // The ID for this element in your code is editProductImage, not productImage
        imageUrl: document.getElementById('editProductImage').value || "" 
    };

    // Correct way to log an object
    console.log("Submitting product data for update:", productData); 
    
    updateProduct(productData);
});

// Edit user form handler
editUserForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        id: parseInt(document.getElementById('editUserId').value),
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        password: document.getElementById('editUserPassword').value
    };
    
    updateUser(userData);
});

// Load products function
async function loadProducts() {
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:8081/api/products');
        if (response.ok) {
            const data = await response.json();
            console.log('Loaded products:', data);
            products = Array.isArray(data) ? data : (data.products || products);
            displayProducts(products);
            // console.log('Products displayed:', products);
        } else {
            console.error('Failed to load products:', response.status);
            displayProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        displayProducts(products);
    } finally {
        showLoading(false);
    }
}

// Display products function
function displayProducts(productList) {
    productsContainer.innerHTML = '';
    
    productList.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create product card with admin controls
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col';
    // console.log("hjk")
    // console.log(product)
    
    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted flex-grow-1">${product.description}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-info btn-sm" onclick="viewProductDetails(${product.productId})" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="editProduct(${product.productId})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.productId})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Add product function
async function addProduct(productData) {
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:8081/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showAlert('Product added successfully!', 'success');
            addProductForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            loadProducts();
        } else {
            showAlert('Failed to add product to backend', 'danger');
        }
    } catch (error) {
        showAlert('Server connection failed', 'danger');
    } finally {
        showLoading(false);
    }
}

// Edit product function
async function editProduct(productId) {
    
    console.log("Product ID:"+productId)

    await fetch(`http://localhost:8081/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            populateEditForm(product);
        })
        .catch(() => {
            const product = products.find(p => p.id === productId);
            if (product) {
                populateEditForm(product);
            }
        });
}

// Populate edit form with product data
function populateEditForm(product) {
    console.log("Editing product:", product);
    document.getElementById('editProductId').value = product.productId || product.id;
    document.getElementById('editProductName').value = product.name || product.product_name;
    document.getElementById('editProductCategory').value = product.categoryId || 1;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductStock').value = product.stockQuantity || product.stock_quantity || 100;
    document.getElementById('editProductImage').value = product.image || product.imageUrl || 'https://via.placeholder.com/400';
    
    // Show edit modal
    new bootstrap.Modal(document.getElementById('editProductModal')).show();
}

// Update product function
function updateProduct(productData) {

    console.log("Product data:"+productData)
    showLoading(true);
    
    // In real implementation, send to: /api/admin/products/{id}
    fetch(`http://localhost:8081/api/products/${productData.productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(productData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showAlert('Product updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            loadProducts();
        } else {
            showAlert('Failed to update product.', 'danger');
        }
    })
    .catch(() => {
        // Demo: update local array
        const index = products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
            products[index] = productData;
            displayProducts(products);
            showAlert('Product updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        }
    })
    .finally(() => {
        showLoading(false);
    });
}

// Delete product function
function deleteProduct(productId) {
    // console.log('Deleting product with ID:', productId);
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    showLoading(true);
    
    // In real implementation, send to: /api/admin/products/{id}
    fetch(`http://localhost:8081/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showAlert('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            showAlert('Failed to delete product.', 'danger');
        }
    })
    .catch(() => {
        // Demo: remove from local array
        products = products.filter(p => p.id !== productId);
        displayProducts(products);
        showAlert('Product deleted successfully!', 'success');
    })
    .finally(() => {
        showLoading(false);
    });
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

// Load orders function
async function loadOrders() {
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:8081/api/admin/orders');
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        } else {
            // Demo data if API fails
            const demoOrders = [
                {
                    id: 1,
                    customerName: 'John Doe',
                    customerEmail: 'john@example.com',
                    products: [{ name: 'Wireless Headphones', quantity: 1, price: 149.99 }],
                    total: 149.99,
                    orderDate: '2024-01-15',
                    status: 'Order Confirmed'
                },
                {
                    id: 2,
                    customerName: 'Jane Smith',
                    customerEmail: 'jane@example.com',
                    products: [{ name: 'Smartwatch Pro', quantity: 2, price: 299.99 }],
                    total: 599.98,
                    orderDate: '2024-01-14',
                    status: 'Shipped'
                },
                {
                    id: 3,
                    customerName: 'Mike Johnson',
                    customerEmail: 'mike@example.com',
                    products: [{ name: 'Ultra-Slim Laptop', quantity: 1, price: 1299.00 }],
                    total: 1299.00,
                    orderDate: '2024-01-13',
                    status: 'Out for Delivery'
                }
            ];
            displayOrders(demoOrders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        displayOrders([]);
    } finally {
        showLoading(false);
    }
}

// Display orders function
function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const productsText = order.products.map(p => `${p.name} (${p.quantity})`).join(', ');
        const statusBadge = getStatusBadge(order.status);
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>
                <div>${order.customerName}</div>
                <small class="text-muted">${order.customerEmail}</small>
            </td>
            <td>
                <span class="text-truncate d-inline-block" style="max-width: 200px;" title="${productsText}">
                    ${productsText}
                </span>
            </td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(row);
    });
}

// Edit user function
function editUser(userId) {
    // Find user data (in real app, fetch from API)
    fetch(`http://localhost:8081/api/admin/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserName').value = user.name || user.username;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserPassword').value = '';
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        })
        .catch(() => {
            // Demo mode - use placeholder data
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUserName').value = 'User ' + userId;
            document.getElementById('editUserEmail').value = `user${userId}@example.com`;
            document.getElementById('editUserPassword').value = '';
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        });
}

// Update user function
async function updateUser(userData) {
    try {
        const response = await fetch(`http://localhost:8081/api/admin/users/${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showAlert('User updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            loadUsers();
        } else {
            showAlert('Failed to update user', 'danger');
        }
    } catch (error) {
        showAlert('User updated successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        loadUsers();
    }
}

// Update user role
async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch(`http://localhost:8081/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        
        if (response.ok) {
            showAlert(`User role updated to ${newRole}`, 'success');
            loadUsers();
        } else {
            showAlert('Failed to update user role', 'danger');
        }
    } catch (error) {
        showAlert(`User role updated to ${newRole}`, 'success');
        console.log('Demo mode: User role updated locally');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`http://localhost:8081/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('User deleted successfully', 'success');
            loadUsers();
        } else {
            showAlert('Failed to delete user', 'danger');
        }
    } catch (error) {
        showAlert('User deleted successfully', 'success');
        console.log('Demo mode: User deleted locally');
        loadUsers();
    }
}

// Get status badge - handles any status message from backend
function getStatusBadge(status) {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
        return `<span class="badge bg-warning">${status}</span>`;
    } else if (statusLower.includes('confirmed') || statusLower.includes('accepted')) {
        return `<span class="badge bg-info">${status}</span>`;
    } else if (statusLower.includes('shipped') || statusLower.includes('transit')) {
        return `<span class="badge bg-primary">${status}</span>`;
    } else if (statusLower.includes('delivered') || statusLower.includes('completed')) {
        return `<span class="badge bg-success">${status}</span>`;
    } else if (statusLower.includes('cancelled') || statusLower.includes('rejected')) {
        return `<span class="badge bg-danger">${status}</span>`;
    } else if (statusLower.includes('delivery')) {
        return `<span class="badge bg-info">${status}</span>`;
    } else {
        return `<span class="badge bg-secondary">${status}</span>`;
    }
}

// View product details function
function viewProductDetails(productId) {
    console.log('Viewing details for product ID:', productId);
    fetch(`http://localhost:8081/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            displayProductDetails(product);
        })
        .catch(() => {
            const product = products.find(p => p.productId === productId);
            if (product) {
                displayProductDetails(product);
            }
        });
}

// Display product details in modal
function displayProductDetails(product) {
    document.getElementById('detailProductName').textContent = product.name || product.product_name;
    document.getElementById('detailProductCategory').textContent = product.categoryId || 'N/A';
    document.getElementById('detailProductPrice').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('detailProductStock').textContent = product.stockQuantity || product.stock_quantity || 'N/A';
    document.getElementById('detailProductDescription').textContent = product.description;
    document.getElementById('detailProductImage').src = product.imageUrl || product.image || 'https://via.placeholder.com/400';
    
    new bootstrap.Modal(document.getElementById('productDetailsModal')).show();
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