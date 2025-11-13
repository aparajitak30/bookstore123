let cart = [];
const BASE_URL = "https://bookstore123-1.onrender.com";

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// DOM elements
const cartBtn = document.getElementById("cartBtn");
const cartPopup = document.getElementById("cartPopup");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const emailInput = document.getElementById("subscribeEmail");

const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const accountBtn = document.getElementById("accountBtn");

// ---------------- CART FUNCTIONS ----------------
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCart();
  showToast(`"${name}" added to your cart!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.padding = "10px 5px";
    li.style.borderBottom = "1px solid #eee";

    // Product name
    const nameDiv = document.createElement("div");
    nameDiv.textContent = item.name;
    nameDiv.style.flex = "1";
    nameDiv.style.marginRight = "10px";

    // Quantity controls
    const qtyDiv = document.createElement("div");
    qtyDiv.style.display = "flex";
    qtyDiv.style.alignItems = "center";
    qtyDiv.style.gap = "5px";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.addEventListener("click", () => changeQuantity(index, -1));

    const qtySpan = document.createElement("span");
    qtySpan.textContent = item.quantity;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => changeQuantity(index, 1));

    qtyDiv.appendChild(minusBtn);
    qtyDiv.appendChild(qtySpan);
    qtyDiv.appendChild(plusBtn);

    // Price
    const priceDiv = document.createElement("div");
    priceDiv.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromCart(index));

    li.appendChild(nameDiv);
    li.appendChild(qtyDiv);
    li.appendChild(priceDiv);
    li.appendChild(removeBtn);

    cartItems.appendChild(li);

    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toFixed(2);
  cartBtn.textContent = `Cart (${cart.length})`;

  // Persist cart
  localStorage.setItem("cart", JSON.stringify(cart));
}

function toggleCart() {
  if (cartPopup.style.display === "flex") {
    cartPopup.style.display = "none";
  } else {
    cartPopup.style.display = "flex";
    cartPopup.style.justifyContent = "center";
    cartPopup.style.alignItems = "center";
  }
}

// ---------------- AUTH FUNCTIONS ----------------
function toggleAuthModal() {
  if (authModal.style.display === "flex") {
    authModal.style.display = "none";
  } else {
    authModal.style.display = "flex";
    authModal.style.justifyContent = "center";
    authModal.style.alignItems = "center";
  }
}

// Logout or open login/register modal
accountBtn.addEventListener("click", () => {
  if (currentUser) {
    if (confirm(`Logout ${currentUser.username}?`)) {
      currentUser = null;
      localStorage.removeItem("currentUser");
      accountBtn.textContent = "Account";
      alert("Logged out successfully!");
    }
  } else {
    toggleAuthModal();
  }
});

// Switch between Login/Register
let isLogin = true;
authSwitch.addEventListener("click", () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Register";
  authSubmit.textContent = isLogin ? "Login" : "Register";
  authSwitch.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

// ---------------- LOGIN/REGISTER ----------------
authSubmit.addEventListener("click", async () => {
  const username = authUsername.value.trim();
  const password = authPassword.value.trim();

  if (!username || !password) return alert("Please fill in all fields!");

  const url = isLogin
  ? `${BASE_URL}/login`
  : `${BASE_URL}/register`;


  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error during authentication");

    if (isLogin) {
      currentUser = { username, token: data.token };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      accountBtn.textContent = username;
      showToast("Login successful!");
    } else {
      alert("Registered successfully! Please login now.");
      isLogin = true;
      authTitle.textContent = "Login";
      authSubmit.textContent = "Login";
      authSwitch.textContent = "Don't have an account? Register";
    }

    toggleAuthModal();
    authUsername.value = "";
    authPassword.value = "";
  } catch (err) {
    console.error(err);
    alert(err.message || "Authentication failed");
  }
});

// ---------------- CHECKOUT ----------------
checkoutBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please login to place an order!");
  if (cart.length === 0) return alert("Your cart is empty!");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const res = await fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
      body: JSON.stringify({ items: cart, total }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    alert(`Order placed successfully! Order ID: ${data.orderId}`);
    cart = [];
    updateCart();
    toggleCart();
  } catch (err) {
    console.error(err);
    alert("Checkout failed. Please try again.");
  }
});

// ---------------- NEWSLETTER ----------------
subscribeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return alert("Please enter your email!");

  try {
    const res = await fetch("`${BASE_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Subscription failed");

    showToast("Subscribed successfully!");
    emailInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Subscription failed. Try again later.");
  }
});

// ---------------- TOAST ----------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ---------------- INITIAL SETUP ----------------
function init() {
  if (currentUser) accountBtn.textContent = currentUser.username;

  const savedCart = JSON.parse(localStorage.getItem("cart"));
  if (Array.isArray(savedCart)) cart = savedCart;

  updateCart();
}

cartBtn.addEventListener("click", toggleCart);
init();

