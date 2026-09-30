const express = require('express');
const path = require('path');
const db = require('./database'); // Connexion à votre base de données
const app = express();
const PORT = process.env.PORT || 3000;

// Permet au serveur de comprendre les données envoyées par l'administration (en JSON)
app.use(express.json());

// Servir les pages web pour les clients et l'admin
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ==========================================
// ROUTES DE L'API (BACKEND)
// ==========================================

// --- GESTION DES PRODUITS ---

// Lire tous les produits
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Ajouter un nouveau produit (depuis le Dashboard)
app.post('/api/products', (req, res) => {
    // 1. Extract desc from req.body
    const { brand, title, cat, price, colors, reviews, img, isNew, desc } = req.body;
    
    // 2. Add desc to the SQL INSERT query
    db.run(`INSERT INTO products (brand, title, cat, price, colors, reviews, img, isNew, desc) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [brand || 'MERCUS', title, cat, price, colors || '1 Couleur', reviews || 100, img, isNew ? 1 : 0, desc],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Supprimer un produit
app.delete('/api/products/:id', (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// --- GESTION DES CODES PROMO ---

// Lire tous les codes promo
app.get('/api/promos', (req, res) => {
    db.all("SELECT * FROM promos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Ajouter un code promo
app.post('/api/promos', (req, res) => {
    const { code, type, value } = req.body;
    db.run(`INSERT INTO promos (code, type, value) VALUES (?, ?, ?)`,
        [code, type, value],
        function(err) {
            if (err) return res.status(500).json({ error: "Ce code existe déjà ou erreur serveur." });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Supprimer un code promo
app.delete('/api/promos/:code', (req, res) => {
    db.run(`DELETE FROM promos WHERE code = ?`, req.params.code, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
app.listen(PORT, () => {
    console.log(`Le serveur MERCUS est en ligne sur http://localhost:${PORT}`);
});