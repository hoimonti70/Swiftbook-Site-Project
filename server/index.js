//index.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql";
import cors from "cors";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "swiftbook_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1); // Exit the process with a failure code
  }
  console.log("Database connected.");
});

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Commerce Shop API");
});

app.get("/users", (req, res) => {
  const query = "SELECT id, name, email, image_url FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching users.");
    } else {
      res.json(results);
    }
  });
});

app.get("/users/:id", (req, res) => {
  const query = "SELECT id, name, email, image_url FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching user.");
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send("User not found.");
      }
    }
  });
});

app.post("/users", (req, res) => {
  const { name, email, password } = req.body;
  const query = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while creating user.");
    } else {
      res.status(201).send("User created successfully.");
    }
  });
});

// user log in
app.post("/users/login", (req, res) => {
  const { email, password } = req.body;
  const query =
    "SELECT id, name, email FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while logging in.");
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(401).send("Invalid email or password.");
      }
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
