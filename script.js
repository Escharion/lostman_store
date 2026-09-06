let products = JSON.parse(localStorage.getItem('yuniqma_products')) || [
    {
        id: 'p1',
        name: 'Lostman Vintage Hoodie',
        price: 85.00,
        desc: 'Heavyweight organic cotton washed finish with minimal emblem branding.',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p2',
        name: 'Urban Wanderer Jacket',
        price: 140.00,
        desc: 'Weather-resistant utility jacket engineered for night walks and cityscapes.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p3',
        name: 'Chronicle Graphic Tee',
        price: 45.00,
        desc: 'Soft breathable cotton featuring signature Mr. Lostman typographic design.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p4',
        name: 'Nomad Cargo Pants',
        price: 95.00,
        desc: 'Relaxed fit tapered cargo pants with deep functional multi-pockets.',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600'
    }
];

let cart = [];
let orders = JSON.parse(localStorage.getItem('yuniqma_orders')) || [];
let tempBase64Image = '';
const ADMIN_PASSWORD = "lostman2026";

window.onload = function() {
    renderProducts();
    updateCartUI();
    renderAdminOrders();
    renderHistoryOrders();
    checkNewProductAlert();
};

function checkNewProductAlert() {
    const lastSeenCount = Number(localStorage.getItem('yuniqma_seen_count') || 4);
    const badge = document.getElementById('new-product-badge');
    if (products.length > lastSeenCount && badge) {
        badge.classList.remove('hidden');
    } else if (badge) {
        badge.classList.add('hidden');
    }
}

function openNewProductModal() {
    localStorage.setItem('yuniqma_seen_count', products.length);
    checkNewProductAlert();
    const container = document.getElementById('latest-drop-content');
    if (container) {
        container.innerHTML = products.slice(0, 3).map(p => `
            <div class="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <img src="${p.image}" class="w-14 h-14 object-cover rounded-lg border border-slate-600">
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-white">${p.name}</span>
                        <span class="text-xs font-mono font-bold text-amber-400">$${Number(p.price).toFixed(2)}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-1">${p.desc}</p>
                </div>
            </div>
        `).join('');
    }
    document.getElementById('new-product-modal').classList.remove('hidden');
}

function closeNewProductModal() {
    document.getElementById('new-product-modal').classList.add('hidden');
}

function previewSelectedImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        tempBase64Image = e.target.result;
        const wrapper = document.getElementById('image-preview-wrapper');
        const imgTag = document.getElementById('preview-img-tag');
        if (wrapper && imgTag) {
            imgTag.src = tempBase64Image;
            wrapper.classList.remove('hidden');
        }
    };
    reader.readAsDataURL(file);
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('product-count');
    if (countEl) countEl.innerText = `${products.length} items`;
    if (!grid) return;

    grid.innerHTML = products.map(p => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition flex flex-col">
            <div class="h-64 overflow-hidden bg-slate-800 relative">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <span class="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-slate-700">
                    $${Number(p.price).toFixed(2)}
                </span>
            </div>
            <div class="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div class="space-y-1">
                    <h4 class="font-bold text-white tracking-tight">${p.name}</h4>
                    <p class="text-xs text-slate-400 leading-relaxed">${p.desc}</p>
                </div>
                <button onclick="addToCart('${p.id}')" class="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700 hover:border-amber-500">
                    <i class="fa-solid fa-plus"></i> Add to Bag
                </button>
            </div>
        </div>
    `).join('');
}

function handleAddNewProduct(event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById('new-prod-name');
    const priceInput = document.getElementById('new-prod-price');
    const descInput = document.getElementById('new-prod-desc');
    if (!nameInput || !priceInput || !descInput) return;

    if (!tempBase64Image) {
        alert("Please upload an image or take a photo with your camera first!");
        return;
    }

    const newProduct = {
        id: 'prod-' + Date.now(),
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value),
        image: tempBase64Image,
        desc: descInput.value.trim()
    };

    products.unshift(newProduct);
    localStorage.setItem('yuniqma_products', JSON.stringify(products));

    nameInput.value = '';
    priceInput.value = '';
    descInput.value = '';
    tempBase64Image = '';
    document.getElementById('image-preview-wrapper').classList.add('hidden');
    document.getElementById('add-product-form').reset();

    renderProducts();
    checkNewProductAlert();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!badge || !container || !totalEl) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalCount > 0) {
        badge.innerText = totalCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    totalEl.innerText = `$${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-500 font-mono text-xs">Your shopping bag is empty</div>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="pt-4 first:pt-0 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <img src="${item.image}" class="w-10 h-10 object-cover rounded-lg border border-slate-700">
                <div class="space-y-0.5">
                    <h5 class="text-xs font-bold text-white">${item.name}</h5>
                    <p class="text-xs text-amber-400 font-mono">$${Number(item.price).toFixed(2)} each</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" min="1" value="${item.quantity}" onchange="updateItemQuantity('${item.id}', this.value)" class="w-14 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 text-center font-mono">
                <button onclick="removeFromCart('${item.id}')" class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"><i class="fa-solid fa-trash text-xs"></i></button>
            </div>
        </div>
    `).join('');
}

function updateItemQuantity(productId, newQty) {
    const qty = parseInt(newQty);
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (isNaN(qty) || qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    } else {
        item.quantity = qty;
    }
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartUI();
}

function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    if (forceOpen) {
        drawer.classList.remove('hidden');
    } else {
        drawer.classList.toggle('hidden');
    }
}

function checkoutOrder() {
    const locationInput = document.getElementById('delivery-location');
    const location = locationInput ? locationInput.value.trim() : '';

    if (cart.length === 0 || !location) {
        alert("Please add items and enter a delivery location.");
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
        id: orderId,
        items: [...cart],
        total: totalPrice,
        location: location,
        status: 'Processing',
        date: new Date().toISOString()
    };

    orders.unshift(newOrder);
    localStorage.setItem('yuniqma_orders', JSON.stringify(orders));

    let waMessage = `*New Order: Yuniqma (Mr. Lostman Story)*\n\n📋 *Order ID:* ${orderId}\n📍 *Location:* ${location}\n\n🛍️ *Items:*\n`;
    cart.forEach(item => {
        waMessage += `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})\n`;
    });
    waMessage += `\n💰 *Total:* $${totalPrice.toFixed(2)}`;

    window.open(`https://wa.me/233537191335?text=${encodeURIComponent(waMessage)}`, '_blank');

    cart = [];
    if (locationInput) locationInput.value = '';
    updateCartUI();
    toggleCart();
    renderAdminOrders();
    renderHistoryOrders();
}

let isAdmin = false;

function switchMainView(viewName) {
    document.getElementById('store-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('history-view').classList.add('hidden');
    isAdmin = false;

    if (viewName === 'store') {
        document.getElementById('store-view').classList.remove('hidden');
    } else if (viewName === 'history') {
        document.getElementById('history-view').classList.remove('hidden');
        renderHistoryOrders();
    }
}

function handleAdminButtonClick() {
    if (isAdmin) {
        toggleAdminView();
    } else {
        document.getElementById('admin-password-modal').classList.remove('hidden');
        document.getElementById('admin-password-input').value = '';
        document.getElementById('admin-password-input').focus();
    }
}

function closeAdminPasswordModal() {
    document.getElementById('admin-password-modal').classList.add('hidden');
}

function verifyAdminPassword() {
    const passwordInput = document.getElementById('admin-password-input').value;
    if (passwordInput === ADMIN_PASSWORD) {
        closeAdminPasswordModal();
        toggleAdminView();
    } else {
        alert("Incorrect password!");
    }
}

function toggleAdminView() {
    isAdmin = !isAdmin;
    document.getElementById('store-view').classList.add('hidden');
    document.getElementById('history-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');

    if (isAdmin) {
        document.getElementById('admin-view').classList.remove('hidden');
        document.getElementById('view-text').innerText = 'Storefront';
        document.getElementById('view-icon').className = 'fa-solid fa-store';
        renderAdminOrders();
    } else {
        document.getElementById('store-view').classList.remove('hidden');
        document.getElementById('view-text').innerText = 'Admin Panel';
        document.getElementById('view-icon').className = 'fa-solid fa-lock';
    }
}

function renderAdminOrders() {
    const container = document.getElementById('admin-orders-container');
    const totalOrdersEl = document.getElementById('admin-total-orders');
    if (totalOrdersEl) totalOrdersEl.innerText = orders.length;
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs font-mono">No orders recorded yet.</div>`;
        return;
    }

    container.innerHTML = orders.map(ord => `
        <div class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <span class="font-bold font-mono text-sm text-white">${ord.id}</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">${ord.status}</span>
                </div>
                <div class="text-xs text-slate-300 space-y-1">
                    <p><strong>Address:</strong> ${ord.location}</p>
                    <p><strong>Items:</strong> ${ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-base font-bold font-mono text-amber-400">$${Number(ord.total).toFixed(2)}</span>
                <button onclick="deleteOrder('${ord.id}')" class="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><i class="fa-solid fa-trash text-xs"></i></button>
            </div>
        </div>
    `).join('');
}

function renderHistoryOrders() {
    const container = document.getElementById('history-orders-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `<div class="p-12 text-center text-slate-500 text-xs font-mono">No history available.</div>`;
        return;
    }

    container.innerHTML = orders.map(ord => `
        <div class="p-6 space-y-4">
            <div class="flex justify-between items-center">
                <span class="font-bold text-white font-mono">${ord.id}</span>
                <span class="text-xs text-slate-500">${new Date(ord.date).toLocaleString()}</span>
            </div>
            <p class="text-xs text-amber-200">Location: ${ord.location}</p>
        </div>
    `).join('');
}

function deleteOrder(orderId) {
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('yuniqma_orders', JSON.stringify(orders));
    renderAdminOrders();
    renderHistoryOrders();
}

function clearAllOrders() {
    if (confirm("Clear all order history?")) {
        orders = [];
        localStorage.removeItem('yuniqma_orders');
        renderAdminOrders();
        renderHistoryOrders();
    }
}