const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const path = require('path');

// Configurar dotenv

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'CxNYEodnOUNyZZSbFgyqHAMrwwEBJcIc',
    database: 'punto_metal',
});

// Crear una promesa para la conexión
const db = pool.promise();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

 try {
    console.log('Conectado a la base de datos');

    const dropTableSQL = `DROP TABLE IF EXISTS productos`;
    db.execute(dropTableSQL);
    console.log('Tabla productos eliminada (si existía)');

    const createTableSQL = `
      CREATE TABLE productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL,
        tipo ENUM(
          'anillos',
          'cadenas',
          'relojes',
          'aretes',
          'brasaletes'
        ) NOT NULL,
        imagen_url VARCHAR(255),
        destacado BOOLEAN DEFAULT FALSE
      )
    `;
    db.execute(createTableSQL);
     console.log('Tabla productos creada exitosamente');
     const insertSQL = `
      INSERT INTO productos (nombre, descripcion, precio, stock, tipo, imagen, destacado)
      VALUES 
        ('Anillo de Plata', 'Anillo elegante de plata 925', 1200.00, 10, 'anillos', 'https://img.kwcdn.com/product/fancy/3579c08d-165f-4666-ae9a-1b2f1071f81d.jpg?imageView2/2/w/800/q/70/format/webp', true),
        ('Cadena de Oro', 'Cadena fina de oro 18k', 5600.50, 5, 'cadenas', 'https://img.kwcdn.com/product/open/2024-09-05/1725520740131-23248e8fae114a8a9b4e1cabb5b6c22d-goods.jpeg?imageView2/2/w/800/q/70/format/webp', true),
        ('Reloj Clásico', 'Reloj analógico con correa de cuero', 2400.00, 8, 'relojes', 'https://img.kwcdn.com/product/fancy/e3a4b6d8-738a-4fa9-bd17-a844212dc913.jpg?imageView2/2/w/800/q/70/format/webp', false),
        ('Aretes de Perla', 'Aretes pequeños con perlas auténticas', 1500.00, 12, 'aretes', 'https://img.kwcdn.com/product/fancy/0dd56ef3-a19d-4938-98cf-70fab76897c3.jpg?imageView2/2/w/800/q/70/format/webp', false),
        ('Brazalete de Cuero', 'Brazalete moderno de cuero negro', 980.00, 15, 'brasaletes', 'https://img.kwcdn.com/product/fancy/d4b4420d-412c-4bc8-8614-40c0dbb39f98.jpg?imageView2/2/w/800/q/70/format/webp', true)
    `;
    db.execute(insertSQL);
    console.log('Datos de ejemplo insertados en productos');
    
  } catch (error) {
    console.error('Error:', error);
  } 
}

// Redirigir a index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para productos
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// API de productos
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Endpoint para productos destacados
app.get('/api/products/featured', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE destacado = TRUE LIMIT 3');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).json({ error: 'Error al obtener productos destacados' });
    }
});

// Endpoint para productos filtrados por tipo
app.get('/api/products/type/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const [rows] = await db.query('SELECT * FROM productos WHERE tipo = ?', [type]);
        res.json(rows);
    } catch (error) {
        console.error('Error al filtrar productos por tipo:', error);
        res.status(500).json({ error: 'Error al filtrar productos' });
    }
});

// Ruta de prueba
app.get('/api', async (req, res) => {
    try {
        res.json({ 
            message: '¡Bienvenido a PuntoMetal API!',
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        res.status(500).json({ 
            message: 'Error al conectar a la base de datos',
            error: {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sql: error.sql,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            }
        });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
