// Cart Management System
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartBadge();
        this.bindEvents();
        
        // Load cart when modal is shown
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('show.bs.modal', () => {
                this.loadCart();
            });
        }
    }

    bindEvents() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
    }

    // Add item to cart
    async addToCart(cartItem) {
        const { userId, productId, quantity, name, price, imageUrl } = cartItem;
        
        if (!userId) {
            this.showAlert('Please login to add items to cart', 'warning');
            return;
        }

        try {
            // First, get product details from backend to ensure we have correct data
            const productResponse = await fetch(`http://localhost:8081/api/products/${productId}`);
            const productData = await productResponse.json();
            
            let productDetails = {
                id: productId,
                name: name,
                price: price,
                imageUrl: imageUrl,
                code: `PRD${productId}`
            };

            if (productData.success) {
                productDetails = {
                    id: productData.product.productId,
                    name: productData.product.name,
                    price: productData.product.price,
                    imageUrl: productData.product.imageUrl,
                    code: `PRD${productData.product.productId}`,
                    description: productData.product.description
                };
            }

            // Add to backend
            const backendResponse = await fetch('http://localhost:8081/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    productId: parseInt(productId),
                    quantity: parseInt(quantity)
                })
            });

            const backendData = await backendResponse.json();
            
            if (backendData.success) {
                // Update local cart
                const existingItem = this.cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.cart.push({
                        ...productDetails,
                        quantity: quantity
                    });
                }

                this.saveCart();
                this.updateCartBadge();
                this.showAlert('Product added to cart!', 'success');
            } else {
                throw new Error(backendData.message || 'Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Fallback to local storage
            const existingItem = this.cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({
                    id: productId,
                    name: name || `Product ${productId}`,
                    code: `PRD${productId}`,
                    description: `Description of ${productId}`,
                    price: price || 100,
                    imageUrl: imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop",
                    quantity: quantity
                });
            }

            this.saveCart();
            this.updateCartBadge();
            this.showAlert('Product added to cart (offline mode)', 'info');
        }
    }

    // Remove item from cart
    async removeFromCart(productId) {
        const userId = localStorage.getItem('userId');
        
        try {
            // Find cart item to get cartId
            const cartResponse = await fetch(`http://localhost:8081/api/cart/user/${userId}`);
            const cartData = await cartResponse.json();
            
            if (cartData.success) {
                const cartItem = cartData.cartItems.find(item => item.productId === productId);
                
                if (cartItem) {
                    // Remove from backend
                    const deleteResponse = await fetch(`http://localhost:8081/api/cart/${cartItem.cartId}`, {
                        method: 'DELETE'
                    });
                    
                    const deleteData = await deleteResponse.json();
                    if (!deleteData.success) {
                        throw new Error(deleteData.message);
                    }
                }
            }
        } catch (error) {
            console.error('Error removing from backend cart:', error);
        }

        // Remove from local cart
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartBadge();
        this.loadCart();
        this.showAlert('Item removed from cart', 'info');
    }

    // Update quantity
    async updateQuantity(productId, quantity) {
        const userId = localStorage.getItem('userId');
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            item.quantity = quantity;
            this.saveCart();
            this.updateCartBadge();
            this.loadCart();
            
            // Update backend (this would require a PUT endpoint for cart updates)
            try {
                // Since there's no update endpoint, we'll remove and re-add
                await this.removeFromCart(productId);
                await this.addToCart({
                    userId: parseInt(userId),
                    productId: productId,
                    quantity: quantity,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl
                });
            } catch (error) {
                console.error('Error updating cart quantity:', error);
            }
        }
    }

    // Clear entire cart
    async clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Are you sure you want to clear your cart?')) {
            const userId = localStorage.getItem('userId');
            
            try {
                // Get all cart items and remove them
                const cartResponse = await fetch(`http://localhost:8081/api/cart/user/${userId}`);
                const cartData = await cartResponse.json();
                
                if (cartData.success && cartData.cartItems) {
                    // Remove each item from backend
                    for (const item of cartData.cartItems) {
                        await fetch(`http://localhost:8081/api/cart/${item.cartId}`, {
                            method: 'DELETE'
                        });
                    }
                }
            } catch (error) {
                console.error('Error clearing backend cart:', error);
            }

            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            this.loadCart();
            this.showAlert('Cart cleared successfully', 'info');
        }
    }

    // Load and display cart
    async loadCart() {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            this.displayCart([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/cart/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.cartItems) {
                // Convert backend cart items to frontend format
                const cartItems = await Promise.all(data.cartItems.map(async (item) => {
                    try {
                        // Get product details
                        const productResponse = await fetch(`http://localhost:8081/api/products/${item.productId}`);
                        const productData = await productResponse.json();
                        
                        if (productData.success) {
                            return {
                                id: item.productId,
                                cartId: item.cartId,
                                name: productData.product.name,
                                description: productData.product.description,
                                price: productData.product.price,
                                imageUrl: productData.product.imageUrl,
                                code: `PRD${item.productId}`,
                                quantity: item.quantity
                            };
                        }
                    } catch (error) {
                        console.error('Error fetching product details:', error);
                    }
                    
                    // Fallback if product details can't be fetched
                    return {
                        id: item.productId,
                        cartId: item.cartId,
                        name: `Product ${item.productId}`,
                        description: 'Product description',
                        price: 100,
                        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop',
                        code: `PRD${item.productId}`,
                        quantity: item.quantity
                    };
                }));
                
                this.cart = cartItems;
                this.saveCart();
                this.displayCart(cartItems);
            } else {
                this.displayCart(this.cart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.displayCart(this.cart);
        }
    }

    // Display cart items
    displayCart(cartData) {
        const cartTableBody = document.getElementById('cart-table-body');
        const cartEmpty = document.getElementById('cart-empty');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');

        if (!cartTableBody || !cartEmpty || !cartItemsContainer || !cartFooter) {
            console.error('Cart elements not found');
            return;
        }

        if (cartData.length === 0) {
            cartEmpty.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            cartFooter.style.display = 'none';
            return;
        }

        cartEmpty.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        cartFooter.style.display = 'block';

        cartTableBody.innerHTML = '';
        let total = 0;

        cartData.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.imageUrl}" alt="${item.name}" class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">${item.description || 'No description'}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary">${item.code}</span></td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary btn-sm" type="button" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" min="1" onchange="cartManager.updateQuantity(${item.id}, parseInt(this.value))">
                        <button class="btn btn-outline-secondary btn-sm" type="button" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td>₹${typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</td>
                <td class="fw-bold">₹${subtotal.toLocaleString()}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="cartManager.removeFromCart(${item.id})" title="Remove item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        const cartTotalElement = document.getElementById('cart-total');
        if (cartTotalElement) {
            cartTotalElement.textContent = `₹${total.toLocaleString()}`;
        }
    }

    // Update cart badge
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
            setTimeout(() => {
                if (!badge.classList.contains('show')) {
                    badge.style.display = 'none';
                }
            }, 300);
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Checkout process - redirect to order summary
    checkout() {
        if (this.cart.length === 0) {
            this.showAlert('Your cart is empty!', 'warning');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.showAlert('Please login to proceed with order', 'warning');
            return;
        }

        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            const modal = bootstrap.Modal.getInstance(cartModal);
            if (modal) {
                modal.hide();
            }
        }
        window.location.href = 'order-summary.html';
    }

    // Show alert messages
    showAlert(message, type) {
        const alertContainer = document.getElementById('main-cart-alerts') || document.getElementById('cart-alerts');
        if (!alertContainer) {
            console.error('Alert container not found');
            return;
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();
window.cartManager = cartManager; // Make globally accessible

// Global function for add to cart buttons
function addToCart(cartItem) {
    cartManager.addToCart(cartItem);
}