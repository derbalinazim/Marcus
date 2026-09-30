// Les données proviennent maintenant du backend
let wishlist = JSON.parse(localStorage.getItem('mercus_wishlist')) || [];
const categories = ["Tous", "Visage", "Yeux", "Lèvres", "Soins de la peau", "Cheveux"];
let isWishlistView = false; 

function renderCategories() {
    const nav = document.getElementById('categoryNav');
    if(nav) nav.innerHTML = categories.map(cat => `<button class="cat-btn" onclick="filterCategory('${cat}')">${cat}</button>`).join('');
}

function renderProducts(listToRender) {
    const grid = document.getElementById('productsGrid');
    const wishlistBadge = document.getElementById('wishlistCount');
    if (wishlistBadge) wishlistBadge.innerText = wishlist.length;

    if (!listToRender || listToRender.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:#666;'>Aucun produit trouvé dans cette catégorie.</p>";
        return;
    }

    grid.innerHTML = listToRender.map(p => {
        const isLiked = wishlist.includes(p.id);
        const heartIcon = isLiked ? 'fas fa-heart liked' : 'far fa-heart';
        const badgeHTML = p.isNew ? `<span class="badge-new">NEW</span>` : '';

       return `
<div class="product-card">
    <div class="product-image-wrapper">
        ${badgeHTML}
        <button class="btn-heart" onclick="toggleWishlist(${p.id})">
            <i class="${heartIcon}"></i>
        </button>
        <img src="${p.img}" alt="${p.title}">
    </div>
    
    <div class="product-info-left">
        <h3 class="product-title-mock">${p.title}</h3>
        <div class="product-colors">${p.colors || "1 Couleur"}</div>
        
        <!-- Espace pour la description -->
        <p class="product-desc" style="font-size: 0.85rem; color: #666; margin-bottom: 10px; line-height: 1.4;">
            ${p.desc || "Description courte du produit..."}
        </p>
        
        <div class="product-price-bold">${p.price} DZD</div>
        <button class="btn-add" onclick="addToCart(${p.id})">Ajouter au Panier</button>
    </div>
</div>
`;
    }).join('');
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if(index === -1) {
        wishlist.push(id);
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('mercus_wishlist', JSON.stringify(wishlist));
    
    const wishlistBadge = document.getElementById('wishlistCount');
    if (wishlistBadge) wishlistBadge.innerText = wishlist.length;
    
    if (isWishlistView) {
        const favProducts = products.filter(p => wishlist.includes(p.id));
        renderProducts(favProducts);
    } else {
        const activeCatElement = document.querySelector('.cat-btn.active');
        const activeCat = activeCatElement ? activeCatElement.innerText : "Tous";
        filterCategory(activeCat); 
    }
}

function filterCategory(cat) {
    // --- NOUVEAU : Fermer le menu sur mobile lors du choix d'une catégorie ---
    const nav = document.getElementById('categoryNav');
    if (nav) nav.classList.remove('active');

    isWishlistView = false; 
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.innerText = cat === "Tous" ? "Notre Collection" : cat;
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText === cat) btn.classList.add('active');
    });

    const filtered = cat === "Tous" ? products : products.filter(p => p.cat === cat);
    renderProducts(filtered);
}

function toggleWishlistView() {
    isWishlistView = !isWishlistView; 
    
    if (isWishlistView) {
        const favProducts = products.filter(p => wishlist.includes(p.id));
        renderProducts(favProducts);
        const titleEl = document.getElementById('sectionTitle');
        if (titleEl) titleEl.innerText = "Mes Favoris";
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    } else {
        filterCategory("Tous");
    }
}
