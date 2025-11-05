const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const cartCount = document.getElementById("cart-count");
const toastEl = document.getElementById("toast");
const toast = new bootstrap.Toast(toastEl);

let products = [];

// --- Cargar productos desde la API ---
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Error al obtener productos");
    products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error(err);
    productList.innerHTML = `<p class="text-danger text-center">Error al cargar productos.</p>`;
  }
}

// --- Renderizar productos ---
function renderProducts(list) {
  productList.innerHTML = list.map(p => `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="text-muted small">${p.description}</p>
          <p class="fw-bold mb-3">$${p.price.toLocaleString()}</p>
          <button class="btn btn-primary mt-auto" data-id="${p.id}">Agregar al carrito</button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("button[data-id]").forEach(btn =>
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)))
  );
}

// --- Filtro de búsqueda ---
searchInput.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.price.toString().includes(query)
  );
  renderProducts(filtered);
});

// --- Carrito ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  cartCount.textContent = cart.reduce((acc, i) => acc + i.quantity, 0);
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart(cart);
  updateCartCount();
  toast.show();
}

// --- Inicialización ---
updateCartCount();
loadProducts();
  