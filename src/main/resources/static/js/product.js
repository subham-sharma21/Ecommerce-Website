// Role-based UI rendering and product management
// Get user role from localStorage (set during login)
const userRole = localStorage.getItem('userMode') || null; // null = not logged in

let productIdCounter = 1; // Start from 1 since no demo products exist

// Initialize role-based UI on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRoleBasedUI();
    setupProductForm();
    // Load stored products after DOM is fully ready
    setTimeout(loadStoredProducts, 1000);
});

// Initialize UI based on user role
function initializeRoleBasedUI() {
    const adminFormSection = document.getElementById('admin-form-section');
    
    // Only show admin form if logged in as admin
    if (userRole === 'admin') {
        if (adminFormSection) {
            adminFormSection.style.display = 'block';
        }
        console.log('Admin UI loaded');
    } else {
        if (adminFormSection) {
            adminFormSection.style.display = 'none';
        }
        if (userRole === 'customer') {
            console.log('Customer UI loaded');
        } else {
            console.log('Guest UI loaded (not logged in)');
        }
    }
}

// Setup product form submission
function setupProductForm() {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmission);
    }
}

// Handle product form submission
async function handleProductSubmission(e) {
    e.preventDefault();
    
    // Map category to categoryId
    const categoryMap = {
        'electronics': 1,
        'apparel': 2,
        'home-kitchen': 3,
        'books': 4,
        'sports': 5
    };
    
    // Get form data matching backend Product entity
    const formData = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        categoryId: categoryMap[document.getElementById('productCategory').value],
        stockQuantity: parseInt(document.getElementById('productStock').value) || 100,
        imageUrl: document.getElementById('productImage').value.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop'
    };
    
    // Validate form data
    if (!validateProductData(formData)) {
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('#product-form button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
        submitBtn.disabled = true;
        
        // Check if this is an update or create
        const editId = document.getElementById('product-form').getAttribute('data-edit-id');
        let response;
        
        if (editId) {
            // Update existing product
            response = await fetch(`http://localhost:8081/api/products/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            response = await response.json();
        } else {
            // Create new product
            response = await callBackendAPI('/api/products', formData);
        }
        
        if (response.success) {
            // Store product in localStorage for backup
            const productData = response.product;
            productData.category = document.getElementById('productCategory').value;
            
            storeProduct(productData);
            
            // Add product to UI
            addProductToGrid(productData);
            
            // Show success message
            showAlert('success', response.message || 'Product added successfully!');
            
            // Reset form and edit mode
            const form = document.getElementById('product-form');
            form.reset();
            form.removeAttribute('data-edit-id');
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Product';
            
            // If this was an update, refresh the page to show updated product
            if (editId) {
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        } else {
            throw new Error(response.message || 'Failed to add product');
        }
        
    } catch (error) {
        showAlert('danger', 'Error: ' + error.message);
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#product-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Product';
            submitBtn.disabled = false;
        }
    }
}

// Validate product data
function validateProductData(data) {
    if (!data.name || !data.description || !data.price || !data.imageUrl) {
        showAlert('danger', 'Please fill in all required fields');
        return false;
    }
    
    if (data.price <= 0) {
        showAlert('danger', 'Price must be greater than 0');
        return false;
    }
    
    if (!isValidURL(data.imageUrl)) {
        showAlert('danger', 'Please enter a valid image URL');
        return false;
    }
    
    return true;
}

// Check if URL is valid
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Real API call to backend
async function callBackendAPI(endpoint, data) {
    const response = await fetch(`http://localhost:8081${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Add product to the grid
function addProductToGrid(product, animate = true) {
    // Map category to grid selector
    const categoryGridMap = {
        'electronics': '#product-list-electronics',
        'apparel': '#product-list-apparel', 
        'home-kitchen': '#home-kitchen .container .row',
        'books': '#books .container .row',
        'sports': '#sports .container .row'
    };
    
    const gridSelector = categoryGridMap[product.category];
    console.log('Looking for grid:', gridSelector);
    const targetGrid = document.querySelector(gridSelector);
    console.log('Found grid:', targetGrid);
    
    if (targetGrid) {
        const productCard = createProductCard(product);
        targetGrid.appendChild(productCard);
        console.log('Product card added to grid');
        
        if (animate) {
            // Scroll to the new product
            productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight animation
            productCard.classList.add('highlight-new');
            setTimeout(() => {
                productCard.classList.remove('highlight-new');
            }, 3000);
        }
    } else {
        console.error('Grid not found for category:', product.category);
        if (animate) {
            showAlert('danger', 'Category section not found');
        }
    }
}

// Create product card HTML
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col product-item';
    col.setAttribute('data-product-id', product.productId || product.id);
    
    const adminButtons = userRole === 'admin' ? `
        <div class="admin-controls mt-2">
            <button class="btn btn-outline-primary btn-sm me-1" onclick="editProduct(${product.productId || product.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.productId || product.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    ` : '';
    
    const userId = localStorage.getItem('userId');
    const addToCartButton = userId ? `
        <button class="btn btn-custom btn-sm" onclick="addToCartFromProduct({
            userId: ${userId},
            productId: ${product.productId || product.id},
            quantity: 1,
            name: '${product.name}',
            price: ${product.price},
            imageUrl: '${product.imageUrl}'
        })">Add to Cart</button>
    ` : `
        <button class="btn btn-custom btn-sm" onclick="showLoginRequired()">Add to Cart</button>
    `;
    
    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="object-fit:cover; width:100%; height:200px;">
            <div class="card-body p-3">
                <h6 class="card-title mb-2">${product.name}</h6>
                <p class="card-text text-muted small mb-2">${product.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="product-price fw-bold">₹${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</span>
                    ${addToCartButton}
                </div>
                ${adminButtons}
            </div>
        </div>
    `;
    
    return col;
}

// Store product in localStorage for persistence
function storeProduct(product) {
    let storedProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    storedProducts.push(product);
    localStorage.setItem('customProducts', JSON.stringify(storedProducts));
}

// Load products from backend on page load
async function loadStoredProducts() {
    try {
        // Fetch from backend
        const response = await fetch('http://localhost:8081/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const backendProducts = data.products || [];
            console.log('Loaded products from backend:', backendProducts);
            
            // Map backend products to frontend format
            const mappedProducts = backendProducts.map(product => ({
                productId: product.productId,
                id: product.productId,
                name: product.name,
                description: product.description,
                price: product.price,
                category: getCategoryFromId(product.categoryId),
                code: `PRD${product.productId}`,
                imageUrl: product.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop"
            }));
            
            // Display backend products
            setTimeout(() => {
                mappedProducts.forEach(product => {
                    addProductToGrid(product, false);
                });
            }, 100);
            
            // Update counter
            if (backendProducts.length > 0) {
                const maxId = Math.max(...backendProducts.map(p => p.productId || 0));
                productIdCounter = maxId + 1;
            }
        } else {
            console.log('Backend unavailable, no products to load');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Helper function to map categoryId to category name
function getCategoryFromId(categoryId) {
    const categoryMap = {
        1: 'electronics',
        2: 'apparel', 
        3: 'home-kitchen',
        4: 'books',
        5: 'sports'
    };
    return categoryMap[categoryId] || 'electronics';
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`http://localhost:8081/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            
            // Populate form with existing data
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = getCategoryFromId(product.categoryId);
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stockQuantity;
            document.getElementById('productImage').value = product.imageUrl;
            
            // Change form to update mode
            const form = document.getElementById('product-form');
            form.setAttribute('data-edit-id', productId);
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="bi bi-pencil me-2"></i>Update Product';
            
            // Scroll to form
            const adminSection = document.getElementById('admin-form-section');
            if (adminSection) {
                adminSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('danger', 'Failed to load product details');
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove from UI
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                productCard.remove();
            }
            
            // Remove from localStorage
            let storedProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
            storedProducts = storedProducts.filter(p => p.id != productId);
            localStorage.setItem('customProducts', JSON.stringify(storedProducts));
            
            showAlert('success', 'Product deleted successfully!');
        } else {
            showAlert('danger', data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('danger', 'Failed to delete product');
    }
}

// Add to cart from product
function addToCartFromProduct(cartItem) {
    if (window.cartManager) {
        window.cartManager.addToCart(cartItem);
    } else {
        console.error('Cart manager not available');
    }
}

// Show login required message
function showLoginRequired() {
    showAlert('warning', 'Please login to add items to cart');
    // Optionally trigger login modal
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

// Show alert messages
function showAlert(type, message) {
    const alertsContainer = document.getElementById('form-alerts') || document.createElement('div');
    
    if (!document.getElementById('form-alerts')) {
        alertsContainer.id = 'form-alerts';
        alertsContainer.style.position = 'fixed';
        alertsContainer.style.top = '20px';
        alertsContainer.style.right = '20px';
        alertsContainer.style.zIndex = '9999';
        alertsContainer.style.maxWidth = '400px';
        document.body.appendChild(alertsContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}