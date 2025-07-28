document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-grid');
    const typeFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const categoryOptions = ['anillo', 'cadena', 'reloj', 'aretes', 'braceletes'];

    // Actualizar el valor mostrado del rango de precio
    priceRange.addEventListener('input', () => {
        priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString()}`;
    });

    // Cargar productos desde la API
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsContainer.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }

    // Mostrar productos en la página
    function displayProducts(products) {
        const filteredProducts = products.filter(product => {
            const typeMatch = !typeFilter.value || categoryOptions.includes(product.tipo.toLowerCase());
            const priceMatch = product.precio <= parseInt(priceRange.value);
            return typeMatch && priceMatch;
        });

        productsContainer.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <img src="${product.imagen_url}" alt="${product.nombre}">
                <div class="product-info">
                    <h3>${product.nombre}</h3>
                    <p class="product-price">$${product.precio.toLocaleString()}</p>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-type">${product.tipo}</div>
                    <div class="product-details">
                        <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? 'En stock' : 'Agotado'}
                        </span>
                        <button class="add-to-cart" onclick="addToCart('${product.id}')">
                            ${product.stock > 0 ? 'Agregar al Carrito' : 'Notificar cuando esté disponible'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Manejar filtros
    typeFilter.addEventListener('change', () => loadProducts());
    priceRange.addEventListener('change', () => loadProducts());

    // Inicializar
    loadProducts();
});

// Función para agregar al carrito (implementar la lógica del carrito)
function addToCart(productId) {
    // Aquí iría la lógica para agregar al carrito
    console.log('Agregando producto:', productId);
}
