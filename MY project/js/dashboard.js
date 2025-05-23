document.addEventListener('DOMContentLoaded', () => {
    // Handle add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.medicine-card');
            const title = card.querySelector('.med-title').textContent;
            const price = card.querySelector('.med-price').textContent;
            
            // In a real application, you would add to cart functionality here
            console.log('Added to cart:', title, price);
            button.textContent = 'Added ✓';
            button.style.backgroundColor = '#009e75';
            
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.style.backgroundColor = '#00b386';
            }, 2000);
        });
    });

    // Handle search functionality
    const searchInput = document.querySelector('.search-bar input');
    const medicineCards = document.querySelectorAll('.medicine-card');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        medicineCards.forEach(card => {
            const title = card.querySelector('.med-title').textContent.toLowerCase();
            const category = card.querySelector('.med-category').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}); 