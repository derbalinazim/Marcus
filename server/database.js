const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crée ou se connecte au fichier de base de données
const dbPath = path.resolve(__dirname, 'marqus.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err.message);
    } else {
        console.log('Connecté à la base de données SQLite (marqus.db)');
    }
});

// Construction automatique des tables si elles n'existent pas
db.serialize(() => {
    // 1. Création de la table des Produits
   db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT,
    title TEXT,
    cat TEXT,
    price REAL,
    colors TEXT,
    reviews INTEGER,
    img TEXT,
    isNew INTEGER,
    desc TEXT
)`);

    // 2. Création de la table des Codes Promo
    db.run(`CREATE TABLE IF NOT EXISTS promos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        type TEXT,
        value REAL
    )`);
    
    // Ajout d'un code promo par défaut s'il n'y en a aucun
    db.get("SELECT COUNT(*) AS count FROM promos", (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO promos (code, type, value) VALUES ('WELCOME10', 'percent', 10)`);
        }
    });
});

module.exports = db;