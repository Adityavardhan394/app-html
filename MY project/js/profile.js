// Profile state management
const ProfileManager = {
    state: {
        profile: null,
        addresses: [],
        activeSection: 'profile'
    },

    // Initialize profile manager
    init() {
        this.loadState();
        this.setupNavigationHandlers();
        this.setupFormHandlers();
        this.setupImageUpload();
        this.renderActiveSection();
    },

    // Load saved state
    loadState() {
        // Load profile data
        const savedProfile = localStorage.getItem('mediquick_profile');
        if (savedProfile) {
            this.state.profile = JSON.parse(savedProfile);
        } else {
            this.state.profile = {
                name: '',
                email: '',
                phone: '',
                dob: '',
                gender: '',
                image: 'assets/profile-placeholder.jpg'
            };
        }

        // Load addresses
        const savedAddresses = localStorage.getItem('mediquick_addresses');
        if (savedAddresses) {
            this.state.addresses = JSON.parse(savedAddresses);
        }

        this.updateUI();
    },

    // Save state
    saveState() {
        localStorage.setItem('mediquick_profile', JSON.stringify(this.state.profile));
        localStorage.setItem('mediquick_addresses', JSON.stringify(this.state.addresses));
    },

    // Set up navigation handlers
    setupNavigationHandlers() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                this.navigateToSection(targetId);
            });
        });
    },

    // Navigate to section
    navigateToSection(sectionId) {
        // Update active nav item
        document.querySelector('.nav-item.active').classList.remove('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
        
        // Update active section
        document.querySelector('.settings-section.active').classList.remove('active');
        document.getElementById(sectionId).classList.add('active');
        
        this.state.activeSection = sectionId;
        this.renderActiveSection();
    },

    // Set up form handlers
    setupFormHandlers() {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileData();
            });
        }
    },

    // Set up image upload
    setupImageUpload() {
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
        }
    },

    // Handle image upload
    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.profile.image = e.target.result;
            document.getElementById('profile-pic').src = e.target.result;
            this.saveState();
            showNotification('Profile picture updated successfully');
        };
        reader.readAsDataURL(file);
    },

    // Save profile data
    saveProfileData() {
        const formData = {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value
        };

        // Validate data
        if (!this.validateProfileData(formData)) {
            return;
        }

        this.state.profile = { ...this.state.profile, ...formData };
        this.saveState();
        showNotification('Profile updated successfully');
    },

    // Validate profile data
    validateProfileData(data) {
        // Name validation
        if (data.name.length < 2) {
            showNotification('Name must be at least 2 characters long', 'error');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Phone validation
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!phoneRegex.test(data.phone.replace(/\s+/g, ''))) {
            showNotification('Please enter a valid phone number', 'error');
            return false;
        }

        return true;
    },

    // Update UI
    updateUI() {
        // Update profile form
        if (this.state.profile) {
            Object.keys(this.state.profile).forEach(key => {
                const input = document.getElementById(key) || document.getElementById(`full-${key}`);
                if (input && key !== 'image') {
                    input.value = this.state.profile[key];
                }
            });

            // Update profile image
            const profilePic = document.getElementById('profile-pic');
            if (profilePic) {
                profilePic.src = this.state.profile.image;
            }
        }

        // Update address list
        this.renderAddresses();
    },

    // Render active section
    renderActiveSection() {
        switch (this.state.activeSection) {
            case 'addresses':
                this.renderAddresses();
                break;
            case 'payments':
                this.renderPayments();
                break;
            case 'orders':
                this.renderOrders();
                break;
            // Add more sections as needed
        }
    },

    // Render addresses
    renderAddresses() {
        const addressList = document.querySelector('.address-list');
        if (!addressList) return;

        addressList.innerHTML = this.state.addresses.map((address, index) => `
            <div class="address-card">
                <div class="address-type">${address.type}</div>
                <p>${address.street}</p>
                ${address.apt ? `<p>${address.apt}</p>` : ''}
                <p>${address.city}, ${address.state} ${address.zip}</p>
                <div class="address-actions">
                    <button class="edit-button" onclick="ProfileManager.editAddress(${index})">
                        <i class="material-icons">edit</i>
                        Edit
                    </button>
                    <button class="delete-button" onclick="ProfileManager.deleteAddress(${index})">
                        <i class="material-icons">delete</i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Add new address
    openAddAddressModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Address</h3>
                <form id="address-form">
                    <div class="form-group">
                        <label for="address-type">Address Type</label>
                        <select id="address-type" required>
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="street">Street Address</label>
                        <input type="text" id="street" required>
                    </div>
                    <div class="form-group">
                        <label for="apt">Apartment/Suite</label>
                        <input type="text" id="apt">
                    </div>
                    <div class="form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" required>
                    </div>
                    <div class="form-group">
                        <label for="state">State</label>
                        <input type="text" id="state" required>
                    </div>
                    <div class="form-group">
                        <label for="zip">ZIP Code</label>
                        <input type="text" id="zip" required pattern="[0-9]{5}">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="secondary-button" onclick="ProfileManager.closeModal()">Cancel</button>
                        <button type="submit" class="primary-button">Save Address</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('address-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAddress();
        });
    },

    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    },

    // Save address
    saveAddress() {
        const addressData = {
            type: document.getElementById('address-type').value,
            street: document.getElementById('street').value,
            apt: document.getElementById('apt').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value
        };
        
        this.state.addresses.push(addressData);
        this.saveState();
        this.renderAddresses();
        this.closeModal();
        showNotification('Address added successfully');
    },

    // Edit address
    editAddress(index) {
        const address = this.state.addresses[index];
        this.openAddAddressModal();
        
        // Fill form with existing data
        setTimeout(() => {
            Object.keys(address).forEach(key => {
                const input = document.getElementById(key) || document.getElementById(`address-${key}`);
                if (input) {
                    input.value = address[key];
                }
            });
        }, 100);
    },

    // Delete address
    deleteAddress(index) {
        if (confirm('Are you sure you want to delete this address?')) {
            this.state.addresses.splice(index, 1);
            this.saveState();
            this.renderAddresses();
            showNotification('Address deleted successfully');
        }
    },

    // Render payments section
    renderPayments() {
        // Implement payments section UI
    },

    // Render orders section
    renderOrders() {
        // Implement orders section UI
    }
};

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 