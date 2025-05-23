// Emergency state management
const EmergencyService = {
    state: {
        userLocation: null,
        nearbyPharmacies: [],
        emergencyContacts: [],
        recentMedicines: []
    },

    // Initialize emergency services
    init() {
        this.loadState();
        this.setupLocationTracking();
        this.loadEmergencyContacts();
        this.loadRecentMedicines();
        this.setupEventListeners();
    },

    // Load saved state
    loadState() {
        const savedState = localStorage.getItem('emergency_state');
        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
        }
    },

    // Save state
    saveState() {
        localStorage.setItem('emergency_state', JSON.stringify(this.state));
    },

    // Set up location tracking
    setupLocationTracking() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                position => this.handleLocationUpdate(position),
                error => this.handleLocationError(error),
                { enableHighAccuracy: true }
            );
        }
    },

    // Handle location update
    handleLocationUpdate(position) {
        this.state.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
        };
        this.saveState();
        this.updateNearbyPharmacies();
    },

    // Handle location error
    handleLocationError(error) {
        console.error('Location error:', error);
        showNotification('Could not access location. Some features may be limited.', 'warning');
    },

    // Update nearby pharmacies
    async updateNearbyPharmacies() {
        if (!this.state.userLocation) return;

        // Simulate API call to get nearby pharmacies
        const mockPharmacies = [
            {
                id: 1,
                name: 'LifeCare Pharmacy',
                distance: 0.5,
                status: 'open',
                phone: '+1234567890',
                location: {
                    lat: this.state.userLocation.lat + 0.001,
                    lng: this.state.userLocation.lng + 0.001
                }
            },
            {
                id: 2,
                name: 'MedExpress',
                distance: 0.8,
                status: 'open',
                phone: '+1234567891',
                location: {
                    lat: this.state.userLocation.lat - 0.001,
                    lng: this.state.userLocation.lng - 0.001
                }
            },
            {
                id: 3,
                name: 'QuickMeds',
                distance: 1.2,
                status: 'closed',
                phone: '+1234567892',
                location: {
                    lat: this.state.userLocation.lat + 0.002,
                    lng: this.state.userLocation.lng + 0.002
                }
            }
        ];

        this.state.nearbyPharmacies = mockPharmacies;
        this.saveState();
        this.updatePharmacyList();
    },

    // Update pharmacy list UI
    updatePharmacyList() {
        const pharmacyList = document.querySelector('.pharmacy-list');
        if (!pharmacyList) return;

        pharmacyList.innerHTML = this.state.nearbyPharmacies.map(pharmacy => `
            <div class="pharmacy-card">
                <div class="pharmacy-info">
                    <h4>${pharmacy.name}</h4>
                    <p>${pharmacy.distance} miles away</p>
                    <span class="status-${pharmacy.status}">${pharmacy.status}</span>
                </div>
                <button class="call-button" onclick="EmergencyService.callPharmacy('${pharmacy.phone}')">
                    Call Pharmacy
                </button>
            </div>
        `).join('');
    },

    // Call pharmacy
    callPharmacy(phone) {
        window.location.href = `tel:${phone}`;
    },

    // Load emergency contacts
    loadEmergencyContacts() {
        this.state.emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
        this.updateEmergencyContacts();
    },

    // Update emergency contacts UI
    updateEmergencyContacts() {
        const contactsContainer = document.querySelector('.emergency-contacts');
        if (!contactsContainer) return;

        const contactsList = document.createElement('div');
        contactsList.className = 'contacts-list';
        
        this.state.emergencyContacts.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.className = 'contact-card';
            contactCard.innerHTML = `
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>${contact.relation}</p>
                </div>
                <button class="call-button" onclick="EmergencyService.callContact('${contact.phone}')">
                    <i class="material-icons">phone</i>
                    Call
                </button>
            `;
            contactsList.appendChild(contactCard);
        });
        
        const existingList = contactsContainer.querySelector('.contacts-list');
        if (existingList) {
            existingList.remove();
        }
        contactsContainer.appendChild(contactsList);
    },

    // Call emergency contact
    callContact(phone) {
        window.location.href = `tel:${phone}`;
    },

    // Load recent emergency medicines
    loadRecentMedicines() {
        // Simulate loading recent emergency medicines
        this.state.recentMedicines = [
            { name: 'Aspirin 81mg', type: 'emergency' },
            { name: 'Nitroglycerin', type: 'emergency' },
            { name: 'EpiPen', type: 'emergency' }
        ];
        this.updateMedicineChips();
    },

    // Update medicine chips UI
    updateMedicineChips() {
        const medicineChips = document.querySelector('.medicine-chips');
        if (!medicineChips) return;

        medicineChips.innerHTML = this.state.recentMedicines.map(medicine => `
            <div class="medicine-chip">
                <span class="medicine-name">${medicine.name}</span>
                <span class="emergency-tag">${medicine.type}</span>
            </div>
        `).join('');
    },

    // Set up event listeners
    setupEventListeners() {
        // Emergency medicine button
        const medicineButton = document.querySelector('.medicine-button');
        if (medicineButton) {
            medicineButton.addEventListener('click', () => this.handleEmergencyMedicine());
        }

        // Ambulance button
        const ambulanceButton = document.querySelector('.ambulance-button');
        if (ambulanceButton) {
            ambulanceButton.addEventListener('click', () => this.callAmbulance());
        }

        // Add contact button
        const addContactButton = document.querySelector('.add-contact-button');
        if (addContactButton) {
            addContactButton.addEventListener('click', () => this.openAddContactModal());
        }
    },

    // Handle emergency medicine request
    handleEmergencyMedicine() {
        const button = document.querySelector('.medicine-button');
        button.disabled = true;
        button.innerHTML = `
            <i class="material-icons">hourglass_empty</i>
            Requesting...
        `;
        
        // Simulate API call
        setTimeout(() => {
            window.location.href = 'emergency-medicine.html';
        }, 1500);
    },

    // Call ambulance
    callAmbulance() {
        // Check if we have location
        if (this.state.userLocation) {
            // In a real app, we would send location to emergency services
            console.log('Sending location to emergency services:', this.state.userLocation);
        }
        window.location.href = 'tel:911';
    },

    // Add emergency contact modal
    openAddContactModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add Emergency Contact</h3>
                <form id="emergency-contact-form">
                    <div class="form-group">
                        <label for="contact-name">Name</label>
                        <input type="text" id="contact-name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-relation">Relation</label>
                        <input type="text" id="contact-relation" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-phone">Phone Number</label>
                        <input type="tel" id="contact-phone" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="secondary-button" onclick="EmergencyService.closeModal()">Cancel</button>
                        <button type="submit" class="primary-button">Save Contact</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('emergency-contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEmergencyContact();
        });
    },

    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    },

    // Add emergency contact
    addEmergencyContact() {
        const name = document.getElementById('contact-name').value;
        const relation = document.getElementById('contact-relation').value;
        const phone = document.getElementById('contact-phone').value;
        
        const contact = { name, relation, phone };
        this.state.emergencyContacts.push(contact);
        localStorage.setItem('emergencyContacts', JSON.stringify(this.state.emergencyContacts));
        
        this.updateEmergencyContacts();
        this.closeModal();
        showNotification('Emergency contact added successfully');
    }
};

// Initialize emergency services when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    EmergencyService.init();
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