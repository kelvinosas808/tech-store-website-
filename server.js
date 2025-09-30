require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MongoDB Connection ==========
// ========== MongoDB Connection ==========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// ========== Product Schema ==========
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// ========== Middleware ==========
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) cb(null, true);
        else cb(new Error('Only image files are allowed!'));
    }
});

app.use('/uploads', express.static('uploads'));

// ========== API Routes ==========

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Add new product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        if (!name || !price || !description) {
            return res.status(400).json({ error: 'Name, price, and description are required' });
        }

        const newProduct = new Product({
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            category: category || 'uncategorized',
            image: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});


// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const updates = req.body;

        if (req.file) {
            updates.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // delete image file if exists
        if (product.image) {
            try {
                const filename = path.basename(product.image); // extract just the file name
                await fs.unlink(path.join(__dirname, 'uploads', filename));
            } catch (err) {
                console.log('Image not found, skip delete');
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    if (err.message === 'Only image files are allowed!') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
