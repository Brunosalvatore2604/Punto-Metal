// Carrito de compras
let cart = [];

// Función para actualizar el contador del carrito
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
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
