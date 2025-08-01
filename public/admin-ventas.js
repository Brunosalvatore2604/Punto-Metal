document.addEventListener('DOMContentLoaded', () => {
    const ventasTableBody = document.querySelector('#ventasTable tbody');
    const addVentaBtn = document.getElementById('addVentaBtn');
    const ventaModal = document.getElementById('ventaModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const ventaForm = document.getElementById('ventaForm');
    const modalTitle = document.getElementById('modalTitle');
    const productoSelect = document.getElementById('producto_id');
    const logoutBtn = document.getElementById('logoutBtn');
    let ventas = [];
    let productos = [];
    let isEditMode = false;
    let currentVentaId = null;

    // Cargar productos para el select
    async function loadProductos() {
        const res = await fetch('/api/products');
        productos = await res.json();
        productoSelect.innerHTML = productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    }

    // Cargar ventas
    async function loadVentas() {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/ventas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        ventas = await res.json();
        displayVentas();
    }

    // Mostrar ventas en la tabla
    function displayVentas() {
        ventasTableBody.innerHTML = ventas.map(venta => {
            const producto = productos.find(p => p.id === venta.producto_id);
            return `<tr>
                <td>${venta.id}</td>
                <td>${producto ? producto.nombre : venta.producto_id}</td>
                <td>${venta.cantidad}</td>
                <td>$${parseFloat(venta.precio_unitario).toLocaleString('es-ES', {minimumFractionDigits:2})}</td>
                <td>${venta.fecha_venta}</td>
                <td>
                    <button class="btn btn-primary edit-btn" data-id="${venta.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger delete-btn" data-id="${venta.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editVenta(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteVenta(btn.dataset.id));
        });
    }

    // Abrir modal para nueva venta
    addVentaBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    ventaForm.addEventListener('submit', handleSubmit);
    logoutBtn.addEventListener('click', handleLogout);
    window.addEventListener('click', (e) => { if (e.target === ventaModal) closeModal(); });

    function openModal(venta = null) {
        isEditMode = !!venta;
        currentVentaId = venta?.id || null;
        if (isEditMode) {
            modalTitle.textContent = 'Editar Venta';
            productoSelect.value = venta.producto_id;
            document.getElementById('cantidad').value = venta.cantidad;
            document.getElementById('precio_unitario').value = venta.precio_unitario;
            document.getElementById('fecha_venta').value = venta.fecha_venta;
            document.getElementById('ventaId').value = venta.id;
        } else {
            modalTitle.textContent = 'Nueva Venta';
            ventaForm.reset();
        }
        ventaModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        ventaModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        ventaForm.reset();
        isEditMode = false;
        currentVentaId = null;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const formData = new FormData(ventaForm);
        const ventaData = {
            producto_id: parseInt(formData.get('producto_id')),
            cantidad: parseInt(formData.get('cantidad')),
            precio_unitario: parseFloat(formData.get('precio_unitario')),
            fecha_venta: formData.get('fecha_venta')
        };
        let url = '/api/admin/ventas';
        let method = 'POST';
        if (isEditMode) {
            url += `/${currentVentaId}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ventaData)
        });
        if (res.ok) {
            closeModal();
            loadVentas();
        }
    }
    async function editVenta(id) {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/admin/ventas/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const venta = await res.json();
            openModal(venta);
        }
    }
    async function deleteVenta(id) {
        if (!confirm('¿Seguro que deseas eliminar esta venta?')) return;
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/admin/ventas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadVentas();
    }
    function handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/login.html';
    }
    // Inicializar
    loadProductos().then(loadVentas);
});
