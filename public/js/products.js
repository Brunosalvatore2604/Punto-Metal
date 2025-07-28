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

    // Cargar productos desde la API o de la base de datos simulada
    async function loadProducts() {
        try {
            // Si hay una API, descomenta este bloque
            // const response = await fetch('/api/products');
            // allProducts = await response.json();
            
            // Datos de ejemplo (simulando una respuesta de API)
            allProducts = [
                { id: 1, nombre: 'Anillo de Oro', precio: 2500, tipo: 'anillo', descripcion: 'Anillo de oro 18k con diseño clásico', imagen_url: 'https://via.placeholder.com/300x300', stock: 5 },
                { id: 2, nombre: 'Cadena de Plata', precio: 1800, tipo: 'cadena', descripcion: 'Cadena de plata 925 con cierre de seguridad', imagen_url: 'https://via.placeholder.com/300x300', stock: 3 },
                { id: 3, nombre: 'Reloj de Lujo', precio: 8500, tipo: 'reloj', descripcion: 'Reloj automático con correa de cuero', imagen_url: 'https://via.placeholder.com/300x300', stock: 2 },
                { id: 4, nombre: 'Aretes de Diamante', precio: 4200, tipo: 'aretes', descripcion: 'Aretes con diamantes auténticos', imagen_url: 'https://via.placeholder.com/300x300', stock: 4 },
                { id: 5, nombre: 'Brazalete de Oro', precio: 3200, tipo: 'braceletes', descripcion: 'Brazalete ajustable de oro 14k', imagen_url: 'https://via.placeholder.com/300x300', stock: 0 },
                { id: 6, nombre: 'Anillo de Plata', precio: 1500, tipo: 'anillo', descripcion: 'Anillo de plata 925 con diseño moderno', imagen_url: 'https://via.placeholder.com/300x300', stock: 7 }
            ];
            
            filterProducts();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsContainer.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
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
