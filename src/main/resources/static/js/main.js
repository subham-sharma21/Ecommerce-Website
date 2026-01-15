// Utility functions
const API_BASE = 'http://localhost:8081/api';

const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
};

const showError = (element, message) => {
    element.textContent = message;
    element.classList.remove('d-none');
};

const getErrorMessage = (error) => {
    if (error.message.includes('Failed to fetch')) {
        return 'Cannot connect to server. Please check if the backend is running on port 8081.';
    }
    if (error.message.includes('HTTP 401')) return 'Invalid email or password. Please try again.';
    if (error.message.includes('HTTP 400')) return 'Invalid data. Please check your inputs.';
    if (error.message.includes('HTTP 409')) return 'This email is already registered. Please use a different email.';
    if (error.message.includes('HTTP 500')) return 'Server error. Please try again later.';
    return `Request failed: ${error.message}`;
};

// LOGIN FORM
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const errorDiv = document.getElementById('login-error');
        errorDiv.classList.add('d-none');
        
        if (!email || !password) {
            return showError(errorDiv, 'Please enter both email and password.');
        }
        
        try {
            const data = await apiRequest(`${API_BASE}/users/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success) {
                Object.entries({
                    userId: data.userId,
                    userMode: data.isAdmin ? 'admin' : 'customer',
                    userEmail: data.email,
                    username: data.username,
                    userToken: `logged-in-${data.userId}`
                }).forEach(([key, value]) => localStorage.setItem(key, value));
                
                window.location.href = data.isAdmin ? 'admin.html' : 'customer.html';
            } else {
                showError(errorDiv, data.message || 'Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(errorDiv, getErrorMessage(error));
        }
    });
}

// CUSTOMER REGISTER FORM
const customerRegisterForm = document.getElementById('customer-register-form');
if (customerRegisterForm) {
    customerRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('customerRegisterName').value.trim();
        const email = document.getElementById('customerRegisterEmail').value.trim();
        const password = document.getElementById('customerRegisterPassword').value.trim();
        
        console.log('Form values:', { name, email, password });
        const successDiv = document.getElementById('customer-register-success');
        successDiv.classList.add('d-none');
        
        if (!name || !email || !password) {
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            return showError(successDiv, 'Please fill all fields.');
        }
        
        if (password.length < 6) {
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            return showError(successDiv, 'Password must be at least 6 characters long.');
        }
        
        console.log('Sending customer registration:', { username: name, email, password });
        
        try {
            const response = await fetch(`${API_BASE}/users/register/customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                successDiv.textContent = 'Customer account created! You can now log in.';
                successDiv.classList.remove('d-none', 'alert-danger');
                successDiv.classList.add('alert-success');
                customerRegisterForm.reset();
            } else {
                successDiv.classList.remove('alert-success');
                successDiv.classList.add('alert-danger');
                if (response.status === 409) {
                    showError(successDiv, 'This email is already registered. Please use a different email.');
                } else {
                    showError(successDiv, data.message || 'Registration failed.');
                }
            }

        } catch (error) {
            console.error('Customer registration error:', error);
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            showError(successDiv, getErrorMessage(error));
        }
    });
}

// ADMIN REGISTER FORM
const adminRegisterForm = document.getElementById('admin-register-form');
if (adminRegisterForm) {
    adminRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('adminRegisterName').value.trim();
        const email = document.getElementById('adminRegisterEmail').value.trim();
        const password = document.getElementById('adminRegisterPassword').value.trim();
        const adminKey = document.getElementById('adminRegisterKey').value.trim();
        
        console.log('Form values:', { name, email, password, adminKey });
        const successDiv = document.getElementById('admin-register-success');
        successDiv.classList.add('d-none');
        
        if (!name || !email || !password || !adminKey) {
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            return showError(successDiv, 'Please fill all fields including admin security key.');
        }
        
        if (password.length < 6) {
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            return showError(successDiv, 'Password must be at least 6 characters long.');
        }
        
        console.log('Sending admin registration:', { username: name, email, password, adminKey });
        
        try {
            const response = await fetch(`${API_BASE}/users/register/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password, adminKey: adminKey })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                successDiv.textContent = 'Admin account created! You can now log in.';
                successDiv.classList.remove('d-none', 'alert-danger');
                successDiv.classList.add('alert-success');
                adminRegisterForm.reset();
            } else {
                successDiv.classList.remove('alert-success');
                successDiv.classList.add('alert-danger');
                if (response.status === 409) {
                    showError(successDiv, 'This email is already registered. Please use a different email.');
                } else {
                    showError(successDiv, data.message || 'Invalid admin key or registration failed.');
                }
            }

        } catch (error) {
            console.error('Admin registration error:', error);
            successDiv.classList.remove('alert-success');
            successDiv.classList.add('alert-danger');
            showError(successDiv, getErrorMessage(error));
        }
    });
}

// SEARCH FUNCTIONALITY
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.product-item').forEach(item => {
            const title = item.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const description = item.querySelector('.card-text')?.textContent.toLowerCase() || '';
            item.style.display = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm) ? 'block' : 'none';
        });
    });
}


