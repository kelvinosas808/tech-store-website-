// 🔑 Backend API base URL (Render)
const API_BASE = "https://osawese-tech.onrender.com";

// Main store functionality
class OsaweseStore {
    constructor() {
        this.products = [];
        this.cart = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.bindEvents();
    }

    // Load products from backend
    async loadProducts() {
        try {
            const response = await fetch(`${API_BASE}/api/products`);
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showEmptyState();
        }
    }

    // Render products on page
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('empty-state');

        loading.classList.add('hidden');

        if (this.products.length === 0) {
            emptyState.classList.remove('hidden');
            productsGrid.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        productsGrid.classList.remove('hidden');

        productsGrid.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    // Create product card
    createProductCard(product) {
        const imageUrl = product.image 
            ? product.image 
            : 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400';

        const formattedPrice = `₦${parseFloat(product.price).toLocaleString()}`;
        const whatsappNumber = "2349015130233";
        const whatsappMessage = `Hi! I'm interested in the ${product.name} for ${formattedPrice}. Is it available?`;
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        const categoryLabel = (product.category && product.category.toLowerCase() === "smartphone") 
            ? "iPhones" 
            : (product.category || "Tech");

        const cardId = `product-${Math.random().toString(36).substr(2, 9)}`;

        return `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 relative group transform hover:-translate-y-2 border border-gray-100" id="${cardId}">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>
            <div class="absolute top-4 right-4 z-20">
                <span class="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs px-3 py-1.5 rounded-full uppercase tracking-wide font-semibold shadow-lg backdrop-blur-sm">
                    ${categoryLabel}
                </span>
            </div>
            <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <img src="${imageUrl}" alt="${product.name}" 
                     class="w-full h-52 sm:h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                     onerror="this.style.display='none'" loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="p-3 sm:p-6">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm sm:text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                            ${product.name}
                        </h3>
                        <p class="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            ${product.description}
                        </p>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="sm:hidden text-sm font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ${formattedPrice}
                    </span>
                    <a href="${whatsappLink}" target="_blank" class="sm:hidden flex items-center gap-1 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 font-medium shadow-md">
                        ORDER
                    </a>
                    <div class="hidden sm:flex items-center justify-between w-full">
                        <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            ${formattedPrice}
                        </span>
                        <a href="${whatsappLink}" target="_blank" 
                           class="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                            ORDER
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // Example: Add product (if needed later)
    async addProduct(data) {
        try {
            const response = await fetch(`${API_BASE}/api/products`, {
                method: "POST",
                body: data
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding product:", error);
        }
    }

    // Example: Update product
    async updateProduct(id, data) {
        try {
            const response = await fetch(`${API_BASE}/api/products/${id}`, {
                method: "PUT",
                body: data
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating product:", error);
        }
    }

    // Example: Delete product
    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE}/api/products/${id}`, {
                method: "DELETE"
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p._id === productId);
        if (product) {
            const existingItem = this.cart.find(item => item._id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({ ...product, quantity: 1 });
            }
            this.updateCartUI();
            this.showNotification(`${product.name} added to cart!`);
        }
    }

    updateCartUI() {
        const cartButton = document.querySelector('button:contains("Cart")') || 
                          document.querySelector('button[class*="Cart"]') ||
                          document.querySelector('button');
        if (cartButton && cartButton.textContent.includes('Cart')) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartButton.textContent = `Cart (${totalItems})`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    showEmptyState() {
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('empty-state');
        const productsGrid = document.getElementById('products-grid');

        loading.classList.add('hidden');
        emptyState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
    }
}

// Initialize store
const store = new OsaweseStore();

document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.bg-white, .grid > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
