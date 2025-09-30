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

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
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

    // Generate unique ID for this product card
    const cardId = `product-${Math.random().toString(36).substr(2, 9)}`;

    return `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 relative group transform hover:-translate-y-2 border border-gray-100" id="${cardId}">
            
            <!-- Loading Shimmer Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>
            
            <!-- Category Badge with Glow Effect -->
            <div class="absolute top-4 right-4 z-20">
                <span class="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs px-3 py-1.5 rounded-full uppercase tracking-wide font-semibold shadow-lg backdrop-blur-sm">
                    ${categoryLabel}
                </span>
            </div>

            <!-- Mobile Order Button Removed from top -->

            <!-- Image Container with Advanced Effects - More Space -->
            <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="w-full h-52 sm:h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                     onerror="this.style.display='none'"
                     loading="lazy">
                
                <!-- Image Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Quick View Button Removed -->
            </div>

            <!-- Card Body with Compact Layout -->
            <div class="p-3 sm:p-6">
                <!-- Header Section -->
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

                <!-- Price + Order Button Section -->
                <div class="flex items-center justify-between">
                    <!-- Mobile: Smaller Price + Order Button -->
                    <span class="sm:hidden text-sm font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ${formattedPrice}
                    </span>
                    <a href="${whatsappLink}" target="_blank" class="sm:hidden flex items-center gap-1 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 font-medium shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.148 0 11.5c0 2.026.607 3.909 1.65 5.49L0 24l7.35-1.927c1.52.828 3.248 1.28 4.95 1.28 6.627 0 12-5.148 12-11.5S18.627 0 12 0zm0 21c-1.51 0-2.977-.365-4.291-1.056l-.307-.162-4.35 1.14 1.162-4.228-.179-.306C3.54 15.094 3 13.336 3 11.5 3 6.813 7.037 3 12 3s9 3.813 9 8.5-4.037 9.5-9 9.5zm4.26-6.279c-.228-.114-1.349-.664-1.557-.739-.208-.076-.36-.114-.513.114-.152.228-.588.739-.72.89-.133.152-.266.171-.494.057-.228-.114-.96-.354-1.83-1.128-.676-.6-1.132-1.341-1.265-1.569-.133-.228-.014-.351.1-.465.104-.103.228-.266.342-.399.114-.133.152-.228.228-.38.076-.152.038-.285-.019-.399-.057-.114-.513-1.235-.703-1.692-.185-.445-.374-.385-.513-.392-.133-.007-.285-.009-.437-.009s-.399.057-.608.285c-.209.228-.798.779-.798 1.9s.818 2.201.932 2.354c.114.152 1.612 2.465 3.91 3.454.546.235.972.376 1.305.481.548.175 1.047.151 1.441.092.439-.065 1.349-.551 1.54-1.083.19-.532.19-.988.133-1.083-.057-.095-.209-.152-.437-.266z"/>
                        </svg>
                        ORDER
                    </a>

                    <!-- Desktop: Price + Order Button Side by Side -->
                    <div class="hidden sm:flex items-center justify-between w-full">
                        <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            ${formattedPrice}
                        </span>
                        <a href="${whatsappLink}" target="_blank" 
                           class="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.148 0 11.5c0 2.026.607 3.909 1.65 5.49L0 24l7.35-1.927c1.52.828 3.248 1.28 4.95 1.28 6.627 0 12-5.148 12-11.5S18.627 0 12 0zm0 21c-1.51 0-2.977-.365-4.291-1.056l-.307-.162-4.35 1.14 1.162-4.228-.179-.306C3.54 15.094 3 13.336 3 11.5 3 6.813 7.037 3 12 3s9 3.813 9 8.5-4.037 9.5-9 9.5z"/>
                            </svg>
                            ORDER
                        </a>
                    </div>
                </div>

            </div>

            <!-- Floating Action Button Removed -->
        </div>

        <style>
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .animate-shimmer {
                animation: shimmer 2s infinite;
            }
            .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        </style>

        <script>
            // Removed unnecessary functions - keeping only essential ones
            console.log('Advanced product card loaded');
        </script>
    `;
}

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            const existingItem = this.cart.find(item => item.id === productId);
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
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle (if needed)
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        // Add mobile menu functionality if needed
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

// Initialize the store when the page loads
const store = new OsaweseStore();

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.bg-white, .grid > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});