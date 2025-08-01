
// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-grid');
    const typeFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Mostrar/ocultar el carrito desplegable
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartDropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
        if (!cartDropdown.contains(e.target) && !cartIcon.contains(e.target)) {
            cartDropdown.classList.remove('show');
        }
    });

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
                        <button class="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock > 0 ? 'Agregar al Carrito' : 'Notificar cuando esté disponible'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Asignar eventos a los botones de agregar al carrito
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                addToCart(id);
            });
        });
    }

    // Actualizar el contador y el contenido del carrito
    function updateCartUI() {
        cartCount.textContent = cart.length;
        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align:center;color:#aaa;">El carrito está vacío</div>';
            cartTotal.textContent = 'Total: $0';
            return;
        }
        let total = 0;
        cartItems.innerHTML = cart.map((item, idx) => {
            // Asegurarse de que el precio sea un número
            const precioNum = typeof item.precio === 'string' ? parseFloat(item.precio) : item.precio;
            total += isNaN(precioNum) ? 0 : precioNum;
            return `
                <div class="cart-item">
                    <img src="${item.imagen_url}" class="cart-item-img" alt="${item.nombre}">
                    <div class="cart-item-info">
                        <span class="cart-item-title">${item.nombre}</span>
                        <span class="cart-item-price">$${precioNum.toLocaleString()}</span>
                    </div>
                    <button class="cart-item-remove" data-idx="${idx}" title="Quitar del carrito">&times;</button>
                </div>
            `;
        }).join('');
        cartTotal.textContent = `Total: $${total.toLocaleString()}`;
        // Quitar producto del carrito
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                cart.splice(idx, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            });
        });
        // Habilitar finalizar compra
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    // Acción de finalizar compra por WhatsApp
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            let mensaje = '¡Hola! Quisiera consultar la disponibilidad de los siguientes productos:%0A';
            cart.forEach((item, idx) => {
                mensaje += `%0A${idx + 1}. ${item.nombre} - $${(typeof item.precio === 'string' ? parseFloat(item.precio) : item.precio).toLocaleString()}`;
            });
            let total = cart.reduce((acc, item) => acc + (typeof item.precio === 'string' ? parseFloat(item.precio) : item.precio), 0);
            mensaje += `%0A%0ATotal: $${total.toLocaleString()}`;
            mensaje += `%0A%0A¿Están disponibles? ¡Gracias!`;
            // Número del vendedor (cambiar si es necesario)
            const numero = '59891821275';
            const url = `https://wa.me/${numero}?text=${mensaje}`;
            window.open(url, '_blank');
        });
    }

    // Agregar producto al carrito
    function addToCart(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen_url: product.imagen_url
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        showNotification('Producto agregado al carrito');
    }

    // Notificación simple
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Manejar cambios en los filtros
    typeFilter.addEventListener('change', filterProducts);
    priceRange.addEventListener('change', filterProducts);

    // Inicializar
    loadProducts();
    updateCartUI();
});
