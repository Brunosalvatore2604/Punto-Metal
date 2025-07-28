document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-grid');
    const typeFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    // Base de datos de productos (simulada)
    let allProducts = [];

    // Actualizar el valor mostrado del rango de precio
    priceRange.addEventListener('input', () => {
        priceValue.textContent = `$${parseInt(priceRange.value).toLocaleString()}`;
        filterProducts();
    });

    // Cargar productos desde la base de datos a través de la API
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            allProducts = await response.json();
            
            // Actualizar el rango de precios si es necesario
            if (allProducts.length > 0) {
                const maxPrice = Math.max(...allProducts.map(p => p.precio));
                priceRange.max = maxPrice;
                priceRange.value = maxPrice;
                priceValue.textContent = `$${maxPrice.toLocaleString()}`;
            }
            
            filterProducts();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>
                    <p>${error.message}</p>
                </div>`;
        }
    }

    // Función para filtrar productos
    function filterProducts() {
        const selectedCategory = typeFilter.value;
        const maxPrice = parseInt(priceRange.value);
        
        const filteredProducts = allProducts.filter(product => {
            const matchesCategory = !selectedCategory || product.tipo === selectedCategory;
            const matchesPrice = product.precio <= maxPrice;
            return matchesCategory && matchesPrice;
        });
        
        displayProducts(filteredProducts);
    }

    // Mostrar productos en la página
    function displayProducts(products) {
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con los filtros seleccionados.</p>';
            return;
        }

        productsContainer.innerHTML = products.map(product => `
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

    // Manejar cambios en los filtros
    typeFilter.addEventListener('change', filterProducts);
    priceRange.addEventListener('change', filterProducts);

    // Inicializar
    loadProducts();
});

// Función para agregar al carrito (implementar la lógica del carrito)
function addToCart(productId) {
    // Aquí iría la lógica para agregar al carrito
    console.log('Agregando producto:', productId);
}
