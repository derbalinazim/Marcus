// Variables globales remplies par le Backend
let products = []; 
let globalPromos = [];

// --- NOUVEAU: Fonction pour ouvrir/fermer le menu sur mobile ---
function toggleMobileMenu() {
    const nav = document.getElementById('categoryNav');
    if (nav) nav.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Récupération des produits depuis la base de données
        const resProducts = await fetch('/api/products');
        products = await resProducts.json();

        // 2. Récupération des codes promo depuis la base de données
        const resPromos = await fetch('/api/promos');
        globalPromos = await resPromos.json();

        // 3. Affichage de l'interface
        renderCategories();
        renderProducts(products);
        renderCart();
        
        const savedWishlist = JSON.parse(localStorage.getItem('mercus_wishlist')) || [];
        const wishlistBadge = document.getElementById('wishlistCount');
        if (wishlistBadge) wishlistBadge.innerText = savedWishlist.length;

        // 4. Moteur de recherche lié aux données du Backend
        const searchInput = document.getElementById('searchInputDesktop');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                if (term.length === 0) {
                    isWishlistView = false;
                    filterCategory("Tous");
                    return;
                }
                
                document.getElementById('sectionTitle').innerText = "Résultats de recherche";
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                
                const filtered = products.filter(p => 
                    p.title.toLowerCase().includes(term) || 
                    p.cat.toLowerCase().includes(term) ||
                    (p.brand && p.brand.toLowerCase().includes(term))
                );
                
                renderProducts(filtered);
            });
        }
    } catch (error) {
        console.error("Erreur Backend:", error);
        document.getElementById('productsGrid').innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Erreur : Impossible de se connecter à la base de données.</p>";
    }
});
