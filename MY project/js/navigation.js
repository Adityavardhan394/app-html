// Global state management
const MediQuickApp = {
    state: {
        user: null,
        cart: [],
        orders: [],
        currentOrder: null,
        isLoggedIn: false
    },

    // Initialize app
    init() {
        this.loadState();
        this.setupNavigationGuards();
        this.setupCartListeners();
    },

    // Load saved state from localStorage
    loadState() {
        const savedState = localStorage.getItem('mediquick_state');
        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
        }
    },

    // Save state to localStorage
    saveState() {
        localStorage.setItem('mediquick_state', JSON.stringify(this.state));
    },

    // Navigation guards
    setupNavigationGuards() {
        const publicPages = ['index.html', 'register.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (!publicPages.includes(currentPage) && !this.state.isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }
    },

    // Cart management
    setupCartListeners() {
        const addToCartButtons = document.querySelectorAll('.primary-btn');
        if (addToCartButtons) {
            addToCartButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    if (e.target.closest('.medicine-card')) {
                        const card = e.target.closest('.medicine-card');
                        const medicine = {
                            id: card.dataset.id,
                            name: card.querySelector('h3').textContent,
                            price: card.querySelector('.price').textContent,
                            quantity: 1
                        };
                        this.addToCart(medicine);
                    }
                });
            });
        }
    },

    // Add item to cart
    addToCart(item) {
        const existingItem = this.state.cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push(item);
        }
        this.saveState();
        this.updateCartUI();
        this.showNotification('Item added to cart');
    },

    // Update cart UI
    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.state.cart.reduce((acc, item) => acc + item.quantity, 0);
        }
    },

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Handle login
    async login(phone) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                this.state.isLoggedIn = true;
                this.state.user = {
                    phone: phone,
                    name: 'User'
                };
                this.saveState();
                resolve(true);
            }, 1500);
        });
    },

    // Handle logout
    logout() {
        this.state = {
            user: null,
            cart: [],
            orders: [],
            currentOrder: null,
            isLoggedIn: false
        };
        this.saveState();
        window.location.href = 'index.html';
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    MediQuickApp.init();
}); 