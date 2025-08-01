// --- API de ventas (CRUD) ---
// Obtener todas las ventas
app.get('/api/admin/ventas', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ventas');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// Obtener una venta por ID
app.get('/api/admin/ventas/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener la venta:', error);
        res.status(500).json({ error: 'Error al obtener la venta' });
    }
});

// Crear una venta
app.post('/api/admin/ventas', authenticateToken, async (req, res) => {
    const { producto_id, cantidad, precio_unitario, fecha_venta } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO ventas (producto_id, cantidad, precio_unitario, fecha_venta) VALUES (?, ?, ?, ?)',
            [producto_id, cantidad, precio_unitario, fecha_venta]
        );
        const [newVenta] = await db.query('SELECT * FROM ventas WHERE id = ?', [result.insertId]);
        res.status(201).json(newVenta[0]);
    } catch (error) {
        console.error('Error al crear la venta:', error);
        res.status(500).json({ error: 'Error al crear la venta' });
    }
});

// Actualizar una venta
app.put('/api/admin/ventas/:id', authenticateToken, async (req, res) => {
    const { producto_id, cantidad, precio_unitario, fecha_venta } = req.body;
    try {
        await db.query(
            'UPDATE ventas SET producto_id = ?, cantidad = ?, precio_unitario = ?, fecha_venta = ? WHERE id = ?',
            [producto_id, cantidad, precio_unitario, fecha_venta, req.params.id]
        );
        const [updatedVenta] = await db.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
        if (updatedVenta.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(updatedVenta[0]);
    } catch (error) {
        console.error('Error al actualizar la venta:', error);
        res.status(500).json({ error: 'Error al actualizar la venta' });
    }
});

// Eliminar una venta
app.delete('/api/admin/ventas/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM ventas WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar la venta:', error);
        res.status(500).json({ error: 'Error al eliminar la venta' });
    }
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Configurar dotenv
dotenv.config();
// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'CxNYEodnOUNyZZSbFgyqHAMrwwEBJcIc',
    database: 'punto_metal',
});

// Crear una promesa para la conexión
const db = pool.promise();

// Crear tabla ventas (DROP y CREATE) al iniciar el servidor
(async () => {
    try {
        await db.query('DROP TABLE IF EXISTS ventas');
        await db.query(`CREATE TABLE ventas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            cantidad INT NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            fecha_venta DATE NOT NULL,
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        )`);
        console.log('Tabla ventas creada correctamente.');
    } catch (err) {
        console.error('Error creando tabla ventas:', err);
    }
})();

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

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin API routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Admin login route
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // In a real app, you would validate against a users table in the database
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    try {
        const validUser = username === adminUsername;
        const validPassword = await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10));
        
        if (!validUser || !validPassword) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        const user = { username: adminUsername };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'your-secret-key');
        
        res.json({ accessToken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Protected admin routes
app.get('/api/admin/products', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/api/admin/products/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

app.post('/api/admin/products', authenticateToken, async (req, res) => {
    const { nombre, descripcion, precio, stock, tipo, imagen_url, destacado } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, tipo, imagen_url, destacado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, tipo, imagen_url, destacado || false]
        );
        
        const [newProduct] = await db.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
    const { nombre, descripcion, precio, stock, tipo, imagen_url, destacado } = req.body;
    
    try {
        await db.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, tipo = ?, imagen_url = ?, destacado = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, tipo, imagen_url, destacado || false, req.params.id]
        );
        
        const [updatedProduct] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (updatedProduct.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(updatedProduct[0]);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
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
