document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productsContainer = document.getElementById('productsContainer');
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const modalTitle = document.getElementById('modalTitle');
    
    let products = [];
    let isEditMode = false;
    let currentProductId = null;

    // Event Listeners
    addProductBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    productForm.addEventListener('submit', handleSubmit);
    logoutBtn.addEventListener('click', handleLogout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initialize the admin panel
    function init() {
        loadProducts();
        checkAuth();
    }

    // Check if user is authenticated
    function checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/admin/login.html';
        }
    }

    // Load products from API
    async function loadProducts() {
        try {
            showLoading(true);
            const response = await fetch('/api/admin/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                }
                throw new Error('Error al cargar los productos');
            }
            
            products = await response.json();
            displayProducts(products);
        } catch (error) {
            showNotification('Error al cargar los productos', 'error');
            console.error('Error:', error);
        } finally {
            showLoading(false);
        }
    }

    // Display products in the grid
    function displayProducts(products) {
        if (products.length === 0) {
            productsContainer.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
            return;
        }

        productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.imagen_url}" alt="${product.nombre}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                <div class="product-info">
                    <h3 class="product-title">${product.nombre}</h3>
                    <div class="product-meta">
                        <span>${product.tipo.charAt(0).toUpperCase() + product.tipo.slice(1)}</span>
                        <span class="product-price">$${parseFloat(product.precio).toLocaleString('es-ES')}</span>
                    </div>
                    <p>${product.descripcion?.substring(0, 100)}${product.descripcion?.length > 100 ? '...' : ''}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary edit-btn" data-id="${product.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                editProduct(productId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                deleteProduct(productId);
            });
        });
    }

    // Open modal for adding/editing product
    function openModal(product = null) {
        isEditMode = !!product;
        currentProductId = product?.id || null;
        
        if (isEditMode) {
            modalTitle.textContent = 'Editar Producto';
            // Fill form with product data
            document.getElementById('nombre').value = product.nombre;
            document.getElementById('descripcion').value = product.descripcion || '';
            document.getElementById('precio').value = product.precio;
            document.getElementById('stock').value = product.stock;
            document.getElementById('tipo').value = product.tipo;
            document.getElementById('imagen_url').value = product.imagen_url || '';
            document.getElementById('destacado').checked = product.destacado || false;
        } else {
            modalTitle.textContent = 'Nuevo Producto';
            productForm.reset();
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        productForm.reset();
        isEditMode = false;
        currentProductId = null;
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(productForm);
        const productData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            precio: parseFloat(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            tipo: formData.get('tipo'),
            imagen_url: formData.get('imagen_url'),
            destacado: formData.get('destacado') === 'on'
        };

        try {
            showLoading(true);
            let response;
            
            if (isEditMode) {
                // Update existing product
                response = await fetch(`/api/admin/products/${currentProductId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Create new product
                response = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify(productData)
                });
            }

            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Error al guardar el producto');
            }

            showNotification(
                isEditMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                'success'
            );
            
            closeModal();
            loadProducts();
        } catch (error) {
            showNotification(error.message || 'Error al guardar el producto', 'error');
            console.error('Error:', error);
        } finally {
            showLoading(false);
        }
    }

    // Edit product
    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            openModal(product);
        }
    }

    // Delete product
    async function deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            showLoading(true);
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                }
                throw new Error('Error al eliminar el producto');
            }

            showNotification('Producto eliminado correctamente', 'success');
            loadProducts();
        } catch (error) {
            showNotification(error.message || 'Error al eliminar el producto', 'error');
            console.error('Error:', error);
        } finally {
            showLoading(false);
        }
    }

    // Handle logout
    function handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    }

    // Handle unauthorized access
    function handleUnauthorized() {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    }

    // Show loading state
    function showLoading(isLoading) {
        if (isLoading) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger reflow
        notification.offsetHeight;
        
        // Add show class
        notification.classList.add('show');
        
        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize the admin panel
    init();
});