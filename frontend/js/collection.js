// Sample recipe data (will be replaced with data from Python backend)
let recipes = [
    {
        id: 1,
        title: "Chocolate Chip Cookies",
        ingredients: [
            { quantity: "2", unit: "cups", item: "all-purpose flour" },
            { quantity: "1", unit: "cup", item: "butter, softened" },
            { quantity: "1", unit: "cup", item: "brown sugar" },
            { quantity: "2", unit: "", item: "eggs" },
            { quantity: "2", unit: "cups", item: "chocolate chips" }
        ],
        instructions: [
            "Preheat oven to 375°F",
            "Cream together butter and sugar",
            "Beat in eggs one at a time",
            "Gradually blend in flour",
            "Stir in chocolate chips",
            "Drop by rounded tablespoon onto ungreased cookie sheets",
            "Bake for 9 to 11 minutes"
        ],
        dateAdded: new Date('2024-01-15')
    },
    {
        id: 2,
        title: "Spaghetti Carbonara",
        ingredients: [
            { quantity: "1", unit: "lb", item: "spaghetti" },
            { quantity: "4", unit: "oz", item: "pancetta" },
            { quantity: "4", unit: "", item: "eggs" },
            { quantity: "1", unit: "cup", item: "parmesan cheese" },
            { quantity: "2", unit: "cloves", item: "garlic" }
        ],
        instructions: [
            "Cook spaghetti according to package directions",
            "Fry pancetta until crispy",
            "Whisk eggs and parmesan together",
            "Toss hot pasta with egg mixture",
            "Add pancetta and serve immediately"
        ],
        dateAdded: new Date('2024-02-20')
    },
    {
        id: 3,
        title: "Caesar Salad",
        ingredients: [
            { quantity: "1", unit: "head", item: "romaine lettuce" },
            { quantity: "1/2", unit: "cup", item: "Caesar dressing" },
            { quantity: "1/4", unit: "cup", item: "parmesan cheese" },
            { quantity: "1", unit: "cup", item: "croutons" }
        ],
        instructions: [
            "Wash and chop romaine lettuce",
            "Toss lettuce with Caesar dressing",
            "Add croutons and toss again",
            "Top with shaved parmesan cheese",
            "Serve immediately"
        ],
        dateAdded: new Date('2024-03-10')
    }
];

let filteredRecipes = [...recipes];
let currentView = 'grid';
let currentRecipeId = null;

// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const emptyState = document.getElementById('emptyState');
const noResultsState = document.getElementById('noResultsState');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const recipeCount = document.getElementById('recipeCount');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const modalRecipeTitle = document.getElementById('modalRecipeTitle');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayRecipes();
    updateRecipeCount();
});

// Display recipes
function displayRecipes() {
    if (recipes.length === 0) {
        recipeGrid.style.display = 'none';
        emptyState.style.display = 'block';
        noResultsState.style.display = 'none';
        return;
    }

    if (filteredRecipes.length === 0) {
        recipeGrid.style.display = 'none';
        emptyState.style.display = 'none';
        noResultsState.style.display = 'block';
        return;
    }

    recipeGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    noResultsState.style.display = 'none';

    recipeGrid.innerHTML = filteredRecipes.map(recipe => `
        <div class="recipe-card" onclick="viewRecipe(${recipe.id})">
            <div class="recipe-card-icon">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="recipe-card-content">
                <h3 class="recipe-card-title">${recipe.title}</h3>
                <div class="recipe-card-info">
                    <div class="info-item">
                        <i class="fas fa-list-ul"></i>
                        <span>${recipe.ingredients.length} ingredients</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clipboard-list"></i>
                        <span>${recipe.instructions.length} steps</span>
                    </div>
                </div>
                <div class="recipe-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); viewRecipe(${recipe.id})">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteRecipe(${recipe.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update recipe count
function updateRecipeCount() {
    recipeCount.textContent = recipes.length;
}

// View recipe in modal
function viewRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    currentRecipeId = id;
    modalRecipeTitle.textContent = recipe.title;
    
    modalIngredients.innerHTML = recipe.ingredients.map(ing => {
        const unit = ing.unit ? ` ${ing.unit}` : '';
        return `<li>${ing.quantity}${unit} ${ing.item}</li>`;
    }).join('');

    modalInstructions.innerHTML = recipe.instructions.map(step => 
        `<li>${step}</li>`
    ).join('');

    recipeModal.show();
}

// Delete recipe
function deleteRecipe(id) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    recipes = recipes.filter(r => r.id !== id);
    filteredRecipes = filteredRecipes.filter(r => r.id !== id);
    displayRecipes();
    updateRecipeCount();
    
    // Show success message
    showToast('Recipe deleted successfully', 'success');
}

// Modal delete button
modalDeleteBtn.addEventListener('click', () => {
    if (currentRecipeId) {
        recipeModal.hide();
        setTimeout(() => deleteRecipe(currentRecipeId), 300);
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredRecipes = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchTerm))
    );
    displayRecipes();
});

// Sort functionality
sortSelect.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    
    switch(sortValue) {
        case 'name-asc':
            filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredRecipes.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'date-newest':
            filteredRecipes.sort((a, b) => b.dateAdded - a.dateAdded);
            break;
        case 'date-oldest':
            filteredRecipes.sort((a, b) => a.dateAdded - b.dateAdded);
            break;
        case 'ingredients-asc':
            filteredRecipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
            break;
        case 'ingredients-desc':
            filteredRecipes.sort((a, b) => b.ingredients.length - a.ingredients.length);
            break;
    }
    
    displayRecipes();
});

// View toggle
gridViewBtn.addEventListener('click', () => {
    currentView = 'grid';
    recipeGrid.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
});

listViewBtn.addEventListener('click', () => {
    currentView = 'list';
    recipeGrid.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

// Toast notification function
function showToast(message, type) {
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast show" role="alert">
                <div class="toast-header bg-${type} text-white">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    <strong class="me-auto">Notification</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    
    setTimeout(() => {
        const toastElement = document.querySelector('.toast');
        if (toastElement) {
            toastElement.remove();
        }
    }, 3000);
}

// API function to load recipes from backend (to be implemented)
function loadRecipesFromBackend() {
    // This will be connected to your Python backend
    // fetch('/api/recipes')
    //     .then(response => response.json())
    //     .then(data => {
    //         recipes = data;
    //         filteredRecipes = [...recipes];
    //         displayRecipes();
    //         updateRecipeCount();
    //     });
}