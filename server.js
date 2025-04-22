const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({ secret: 'inventorySecret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1212@Nmnm',
    database: 'inventorydb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Routes for pages
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Register
app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)',
        [req.body.username, hashedPassword],
        (err) => {
            if (err) return res.status(500).send('Registration failed');
            res.redirect('/login');
        });
});

// Login
app.post('/login', (req, res) => {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).send('Invalid credentials');
        const user = results[0];
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// Middleware
function authenticate(req, res, next) {
    if (!req.session.user) return res.status(401).send('Unauthorized');
    next();
}

function authorizeAdmin(req, res, next) {
    if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
    next();
}

// Add Warehouse
app.post('/add-warehouse', (req, res) => {
    const { Warehouse_ID, Location, Capacity } = req.body;
    const query = 'INSERT INTO warehouse (Warehouse_ID, Location, Capacity) VALUES (?, ?, ?)';
    db.query(query, [Warehouse_ID, Location, Capacity], (err, results) => {
      if (err) {
        console.error('Insert Error:', err);
        return res.status(500).send('Error saving data');
      }
      res.status(200).send('Warehouse added successfully');
    });
  });
  // Serve warehouse.html page
app.get('/warehouse', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'warehouse.html'));
  });
  
  // API to get warehouse data
  app.get('/api/warehouses', (req, res) => {
    const sql = 'SELECT * FROM Warehouse';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching warehouses:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  });
  
  
  

// Remove Warehouse
app.post('/delete-Warehouse', authenticate, authorizeAdmin, (req, res) => {
    const { Warehouse_id } = req.body;
    db.query('DELETE FROM Warehouse WHERE id = ?', [Warehouse_id], (err) => {
        if (err) return res.status(500).send('Failed to delete Warehouse');
        res.redirect('/dashboard');
    });
});

// Add Store
app.post("/add-store", (req, res) => {
    const { Store_No, Store_Name, Location, Owner_Name } = req.body;
  
    const query = "INSERT INTO store (Store_No, Store_Name, Location, Owner_Name) VALUES (?, ?, ?, ?)";
    const values = [Store_No, Store_Name, Location, Owner_Name];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting store:", err);
        return res.status(500).json({ message: "Failed to add store" });
      }
      res.status(200).json({ message: "Store added successfully" });
    });
  });
  

// Remove Store
app.post('/delete-store', authenticate, authorizeAdmin, (req, res) => {
    const { store_id } = req.body;
    db.query('DELETE FROM stores WHERE id = ?', [store_id], (err) => {
        if (err) return res.status(500).send('Failed to delete store');
        res.redirect('/dashboard');
    });
});

app.get('/api/stores', (req, res) => {
    db.query('SELECT * FROM Store', (err, results) => {
      if (err) {
        console.error('Error fetching stores:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });

  
// Add Inventory Item
app.post('/add-item', authenticate, authorizeAdmin, (req, res) => {
    const now = new Date();
    const {
        name, category, description, quantity, minLimit, maxLimit,
        price, supplier, Warehouse_id, store_id
    } = req.body;

    db.query(`INSERT INTO items 
        (name, category, description, quantity, minLimit, maxLimit, price, supplier, Warehouse_id, store_id, dateAdded)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name, category, description, quantity, minLimit, maxLimit,
            price, supplier, Warehouse_id, store_id, now
        ],
        (err) => {
            if (err) return res.status(500).send('Failed to add item');
            res.redirect('/dashboard');
        });
});

// Remove Item
app.post('/delete-item', authenticate, authorizeAdmin, (req, res) => {
    const { item_id } = req.body;
    db.query('DELETE FROM items WHERE id = ?', [item_id], (err) => {
        if (err) return res.status(500).send('Failed to delete item');
        res.redirect('/dashboard');
    });
});

// Get Inventory List
app.get('/inventory', authenticate, (req, res) => {
    const query = `
        SELECT items.*, Warehouse.location AS WarehouseLocation, stores.location AS storeLocation 
        FROM items
        LEFT JOIN Warehouses ON items.Warehouse_id = Warehouses.id
        LEFT JOIN stores ON items.store_id = stores.id
    `;
    db.query(query, (err, items) => {
        if (err) return res.status(500).send('Failed to fetch inventory');
        res.json(items);
    });
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/dashboard');
      }
      res.redirect('/login?message=Logged out successfully');
    });
  });





app.post('/add-product', (req, res) => {
    const { Product_ID, Name, Price, Quantity, Category, Supplier_ID, Warehouse_ID } = req.body;

    // First, insert into Product
    const productQuery = `
        INSERT INTO Product (Product_ID, Name, Price, Category, Supplier_ID, Quantity)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(productQuery, [Product_ID, Name, Price, Category, Supplier_ID, Quantity], (err, result) => {
        if (err) {
            console.error('Product insert error:', err);
            return res.status(500).send('Failed to add product');
        }

        // Then insert into product_warehouse
        const warehouseQuery = `
            INSERT INTO Product_Warehouse (Product_ID, Warehouse_ID, Quantity)
            VALUES (?, ?, ?)
        `;

        db.query(warehouseQuery, [Product_ID, Warehouse_ID, Quantity], (err2, result2) => {
            if (err2) {
                console.error('Product-Warehouse link error:', err2);
                return res.status(500).send('Product added, but failed to link to warehouse');
            }

            res.send('Product added and linked to warehouse');
        });
    });
});


// API to get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM Product', (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(results);
    });
  });
  


app.post('/transfer-product', (req, res) => {
    const { Product_ID, from_type, from_id, to_type, to_id, quantity } = req.body;
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty <= 0) {
        return res.status(400).send("Invalid quantity");
    }

    let sourceTable = from_type === 'store' ? 'Product_Store' : 'Product_Warehouse';
    let sourceColumn = from_type === 'store' ? 'Store_No' : 'Warehouse_ID';

    let targetTable = to_type === 'store' ? 'Product_Store' : 'Product_Warehouse';
    let targetColumn = to_type === 'store' ? 'Store_No' : 'Warehouse_ID';

    // Step 1: Check if enough quantity exists at source
    const checkQtyQuery = `SELECT Quantity FROM ${sourceTable} WHERE Product_ID = ? AND ${sourceColumn} = ?`;
    db.query(checkQtyQuery, [Product_ID, from_id], (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).send("Product not found in source");
        }

        const currentQty = result[0].Quantity;
        if (currentQty < qty) {
            return res.status(400).send("Insufficient quantity in source");
        }

        // Step 2: Subtract quantity from source
        const updateSourceQty = currentQty === qty
            ? `DELETE FROM ${sourceTable} WHERE Product_ID = ? AND ${sourceColumn} = ?`
            : `UPDATE ${sourceTable} SET Quantity = Quantity - ? WHERE Product_ID = ? AND ${sourceColumn} = ?`;

        const sourceParams = currentQty === qty ? [Product_ID, from_id] : [qty, Product_ID, from_id];

        db.query(updateSourceQty, sourceParams, (err2) => {
            if (err2) {
                console.error("Error updating source:", err2);
                return res.status(500).send("Failed to update source quantity");
            }

            // Step 3: Check if product already exists in target
            const checkTargetQuery = `SELECT Quantity FROM ${targetTable} WHERE Product_ID = ? AND ${targetColumn} = ?`;
            db.query(checkTargetQuery, [Product_ID, to_id], (err3, result2) => {
                if (err3) {
                    return res.status(500).send("Failed during target check");
                }

                if (result2.length > 0) {
                    // Step 4A: Update target quantity
                    const updateTargetQty = `UPDATE ${targetTable} SET Quantity = Quantity + ? WHERE Product_ID = ? AND ${targetColumn} = ?`;
                    db.query(updateTargetQty, [qty, Product_ID, to_id], (err4) => {
                        if (err4) {
                            console.error("Update target error:", err4);
                            return res.status(500).send("Failed to update target quantity");
                        }
                        return res.status(200).send("Product transferred successfully");
                    });
                } else {
                    // Step 4B: Insert new target record
                    const insertTarget = `INSERT INTO ${targetTable} (Product_ID, ${targetColumn}, Quantity) VALUES (?, ?, ?)`;
                    db.query(insertTarget, [Product_ID, to_id, qty], (err5) => {
                        if (err5) {
                            console.error("Insert target error:", err5);
                            return res.status(500).send("Failed to insert into target");
                        }
                        return res.status(200).send("Product transferred successfully");
                    });
                }
            });
        });
    });
});


app.get('/warehouse-inventory-data', (req, res) => {
    const query = `
        SELECT pw.Product_ID, pw.Warehouse_ID, pw.Quantity, p.Name, p.Category, p.Price
        FROM product_warehouse pw
        JOIN product p ON pw.Product_ID = p.Product_ID
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching warehouse inventory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});



app.get('/store-inventory-data', (req, res) => {
    const query = `
        SELECT ps.Product_ID, ps.Store_No, ps.Quantity, p.Name, p.Category, p.Price
        FROM product_store ps
        JOIN product p ON ps.Product_ID = p.Product_ID
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching warehouse inventory:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});


// Start server
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));


