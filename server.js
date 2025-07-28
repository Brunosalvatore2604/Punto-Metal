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