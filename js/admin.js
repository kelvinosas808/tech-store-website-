// ===============================
// Admin panel functionality
// ===============================
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.products = [];
        this.apiBaseUrl = 'http://localhost:3000'; // Base URL for API
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    checkAuthStatus() {
        const authToken = localStorage.getItem('adminAuth');
        if (authToken === 'authenticated') {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        this.isLoggedIn = true;
        this.loadProducts();
        this.updateStats();
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products`);
            if (response.ok) {
                this.products = await response.json();
                this.renderProductsList();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showMessage('Error loading products. Make sure the server is running on port 3000.', 'error');
        }
    }

renderProductsList() {
    const productsList = document.getElementById('products-list');
    
    if (this.products.length === 0) {
        productsList.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-1 1m-6 0l-1 1"></path>
                </svg>
                <p>No products added yet</p>
                <p class="text-sm text-gray-400">Add your first product using the form on the left</p>
            </div>
        `;
        return;
    }

    productsList.innerHTML = this.products.map(product => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center space-x-4">
                ${product.image && product.image.trim() !== "" ? `
                    <div class="flex-shrink-0">
                        <img src="${product.image}" 
                             alt="${product.name}" 
                             class="h-16 w-16 object-cover rounded-md"
                             onerror="this.style.display='none'">
                    </div>
                ` : ""}
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900">${product.name}</h4>
        
                    <p class="text-sm text-gray-500">${
                        product.category 
                         ? product.category.charAt(0).toUpperCase() + product.category.slice(1): 'Uncategorized'}
                   </p>
                    <p class="text-lg font-bold text-primary"> ₦${Number(product.price).toLocaleString("en-NG")}</p>
                </div>
                <div class="flex-shrink-0">
                    <button onclick="adminPanel.deleteProduct('${product._id}')" 
                            class="text-red-600 hover:text-red-900 transition-colors">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}


    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('Product deleted successfully!', 'success');
                await this.loadProducts();
            } else {
                let errorData = {};
                try { errorData = await response.json(); } catch {}
                this.showMessage(`Error deleting product: ${errorData.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showMessage('Error deleting product', 'error');
        }
    }

    updateStats() {
        document.getElementById('total-products').textContent = this.products.length;
        document.getElementById('last-updated').textContent = new Date().toLocaleDateString();
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.getElementById('form-message');
        messageDiv.className = `mt-4 p-3 rounded-md ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }

    bindEvents() {
        // Already handled by inline event handlers
    }
}

// ===============================
// Global functions for inline event handlers
// ===============================
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'tech1234') {
        localStorage.setItem('adminAuth', 'authenticated');
        adminPanel.showDashboard();
        document.getElementById('error-message').classList.add('hidden');
    } else {
        document.getElementById('error-message').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('error-message').classList.add('hidden');
        }, 5000);
    }
}

function logout() {
    localStorage.removeItem('adminAuth');
    adminPanel.showLogin();
    adminPanel.isLoggedIn = false;
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    if (!adminPanel.isLoggedIn) {
        adminPanel.showMessage('Please log in first', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding Product...';
    submitBtn.disabled = true;

    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${adminPanel.apiBaseUrl}/api/products`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            await response.json();
            adminPanel.showMessage('Product added successfully!', 'success');
            event.target.reset();
            await adminPanel.loadProducts();
        } else {
            let errorData = {};
            try { errorData = await response.json(); } catch {}
            adminPanel.showMessage(`Error adding product: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        adminPanel.showMessage('Error connecting to server. Make sure the server is running on port 3000.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ===============================
// Initialize admin panel
// ===============================
const adminPanel = new AdminPanel();

// ===============================
// UI enhancements
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Auto-resize textarea
    const textarea = document.getElementById('productDescription');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // File input preview
    const fileInput = document.getElementById('productImage');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function() {
                    console.log('Image selected:', file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form validation enhancements
    const form = document.getElementById('product-form');
    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('border-red-300');
                } else {
                    this.classList.remove('border-red-300');
                    this.classList.add('border-green-300');
                }
            });

            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('border-red-300');
                    this.classList.add('border-green-300');
                }
            });
        });
    }
});
