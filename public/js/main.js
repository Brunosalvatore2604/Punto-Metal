// Carrito de compras
let cart = [];

// Función para actualizar el contador del carrito
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Cargar productos destacados
    loadFeaturedProducts();
    
    // Event listeners para los botones de "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Event listener para el formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Cargar productos destacados
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products/featured');
        const products = await response.json();
        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
    }
}

// Mostrar productos destacados
function displayFeaturedProducts(products) {
    const featuredContainer = document.querySelector('.product-grid');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imagen_url}" alt="${product.nombre}">
            <h3>${product.nombre}</h3>
            <p>$${product.precio.toLocaleString()}</p>
            <button class="add-to-cart" onclick="addToCart('${product.id}')">
                ${product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </button>
        </div>
    `).join('');
}

function addToCart(event) {
    const productCard = event.target.closest('.product-card');
    const product = {
        name: productCard.querySelector('h3').textContent,
        price: productCard.querySelector('p').textContent,
        image: productCard.querySelector('img').src
    };
    
    cart.push(product);
    updateCartCount();
    
    // Mostrar notificación
    showNotification('Producto agregado al carrito');
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', data);
    
    // Mostrar mensaje de éxito
    showNotification('Mensaje enviado con éxito');
    event.target.reset();
}

// Efecto de deslizamiento suave para los enlaces
document.querySelectorAll('.smooth-scroll').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animaciones al hacer scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.product-card, .about-content, .contact-form').forEach((el) => {
    observer.observe(el);
});
