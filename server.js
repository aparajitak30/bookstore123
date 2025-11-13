require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const path = require("path");

// Load Firebase service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_change_this";

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully!");
});

// 🔒 Middleware: authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = payload; // payload contains id and username
    next();
  });
}

// Register user
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing username or password" });

    const usersRef = db.collection("users");
    const existing = await usersRef.where("username", "==", username).get();
    if (!existing.empty) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = await usersRef.add({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.json({ message: "✅ Registered successfully", id: newUserRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", username).get();
    if (snapshot.empty) return res.status(404).json({ error: "User not found" });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: userDoc.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Add book (any authenticated user)
app.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { title, author, genre, price, rating, image } = req.body;
    if (!title || !author || !genre || !price || !rating || !image)
      return res.status(400).json({ error: "All fields are required" });

    const docRef = await db.collection("books").add({
      title,
      author,
      genre,
      price,
      rating,
      image,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "✅ Book added successfully", id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Fetch all books
app.get("/books", async (req, res) => {
  try {
    const snapshot = await db.collection("books").orderBy("createdAt", "desc").get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Checkout (protected)
app.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!Array.isArray(items) || typeof total !== "number")
      return res.status(400).json({ error: "Invalid cart data" });

    const orderRef = await db.collection("orders").add({
      user_id: req.user.id,
      username: req.user.username,
      items,
      total,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "✅ Order placed", orderId: orderRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// Subscribe
app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    await db.collection("subscribers").add({
      email,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "✅ Subscribed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Subscription failed" });
  }
});

// Fetch orders (protected)
app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("orders").where("user_id", "==", req.user.id).orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
