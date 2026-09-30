let cart = JSON.parse(localStorage.getItem('mercus_cart')) || [];
let activePromo = null;

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

function addToCart(id) {
    // Make sure 'products' is defined in your broader script
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    localStorage.setItem('mercus_cart', JSON.stringify(cart));
    renderCart();
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== id); 
        }
    }
    localStorage.setItem('mercus_cart', JSON.stringify(cart));
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('mercus_cart', JSON.stringify(cart));
    renderCart();
}

// Interrogation de la Base de Données en temps réel
async function applyQuickPromo() {
    const code = document.getElementById('quickPromoInput').value.trim().toUpperCase();
    if (!code) return;
    
    try {
        const response = await fetch('/api/promos');
        const promos = await response.json();
        
        const promo = promos.find(p => p.code === code);
        
        if (promo) {
            activePromo = promo;
            alert(`Code ${code} appliqué avec succès !`);
        } else {
            alert("Code promo invalide ou expiré.");
            activePromo = null;
        }
        renderCart();
    } catch (error) {
        alert("Erreur de connexion lors de la vérification du code.");
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    let subtotal = 0;
    
    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#666; margin-top:20px;'>Votre panier est vide.</p>";
    } else {
        container.innerHTML = cart.map(item => {
            subtotal += item.price * item.qty;
            return `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}" style="width:50px; height:50px;">
                <div class="item-details">
                    <h4 class="item-title">${item.title}</h4>
                    <p class="item-price">${item.price} DZD</p>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                        <button class="item-remove" onclick="removeFromCart(${item.id})">Retirer</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
    
    let discount = 0;
    if (activePromo) {
        if (activePromo.type === 'percent') {
            discount = subtotal * (activePromo.value / 100);
        } else {
            discount = activePromo.value;
        }
    }
    
    const total = Math.max(0, subtotal - discount);
    
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.innerText = subtotal + " DZD";
    
    const discountEl = document.getElementById('cartDiscount');
    if (discountEl) discountEl.innerText = "- " + discount + " DZD";
    
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.innerText = total + " DZD";
    
    const activePromoLabel = document.getElementById('activePromoCodeLabel');
    if (activePromoLabel) activePromoLabel.innerText = activePromo ? activePromo.code : "Aucune";
    
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
}

function openCheckout() {
    if (cart.length === 0) {
        alert("Votre panier est vide.");
        return;
    }
    document.getElementById('cartDrawer').classList.remove('active');
    document.getElementById('checkoutModal').style.display = 'block';
    document.getElementById('checkoutOverlay').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('checkoutOverlay').classList.remove('active');
}

function sendOrderEmail(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('checkoutSubmitBtn');
    submitBtn.innerText = "Validation en cours...";
    submitBtn.disabled = true;
    
    // 1. Format the cart summary using the cart array
    let orderDetails = cart.map(item => `${item.qty}x ${item.title} (${item.price} DZD)`).join('\n');
    
    // Check if elements exist before grabbing text to prevent crashes
    let totalEl = document.getElementById('cartTotal') ? document.getElementById('cartTotal').innerText : "0 DZD";
    let promoLabel = document.getElementById('activePromoCodeLabel') ? document.getElementById('activePromoCodeLabel').innerText : "Aucune";
    
    // 2. Prepare EmailJS data (FIXED: Using variables for order_summary, promo_code, and total)
    const templateParams = {
        nom: document.getElementById('cNom').value,
        prenom: document.getElementById('cPrenom').value,
        telephone: document.getElementById('cTel').value,
        email: document.getElementById('cEmail').value,
        wilaya: document.getElementById('cWilaya').value,
        commune: document.getElementById('cCommune').value,
        adresse: document.getElementById('cAdresse').value,
        notes: document.getElementById('cNotes').value,
        order_summary: orderDetails, 
        promo_code: promoLabel,      
        total: totalEl               
    };

    // 3. Send via EmailJS
    emailjs.send('service_8eotbhj', 'template_7eu5m5q', templateParams)
        .then(function(response) {
            alert('Commande validée ! Vous serez contacté très prochainement.');
            // Clear cart on success
            cart = [];
            activePromo = null;
            localStorage.setItem('mercus_cart', JSON.stringify(cart));
            renderCart();
            closeCheckout();
            document.getElementById('checkoutForm').reset();
        }, function(error) {
            console.error("EmailJS Error:", error);
            alert('Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
        })
        .finally(() => {
            submitBtn.innerText = "Confirmer la commande";
            submitBtn.disabled = false;
        });
}