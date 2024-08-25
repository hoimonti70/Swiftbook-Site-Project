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

// User Registration Endpoint
app.post("/users/register", (req, res) => {
  const { name, email, password, image_url } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).send("Name, email, and password are required.");
  }

  // Check if the email already exists
  const checkEmailQuery = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking email existence:", err);
      return res.status(500).send("An error occurred while checking email.");
    }

    if (results[0].count > 0) {
      return res
        .status(400)
        .send("Email already exists. Please use a different email.");
    }

    // Prepare SQL query to insert new user
    const insertQuery =
      "INSERT INTO users (name, email, password, image_url) VALUES (?, ?, ?, ?)";
    const values = [name, email, password, image_url || ""];

    // Execute SQL query to insert new user
    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).send("An error occurred while creating user.");
      }

      // Fetch the created user data
      const userId = result.insertId;
      const selectQuery =
        "SELECT id, name, email, image_url FROM users WHERE id = ?";

      db.query(selectQuery, [userId], (err, results) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res
            .status(500)
            .send("An error occurred while retrieving user data.");
        }

        const createdUser = results[0];
        res.status(201).json({
          message: "User created successfully.",
          user: createdUser,
        });
      });
    });
  });
});
// user log in
app.post("/users/login", (req, res) => {
  const { email, password } = req.body;
  const query =
    "SELECT id, name, email, image_url FROM users WHERE email = ? AND password = ?";
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

app.get("/posts", (req, res) => {
  const query =
    "SELECT p.id, p.user_id, u.name AS user_name, u.image_url AS user_image_url, p.description, p.image_url, p.created_at FROM posts p JOIN users u ON p.user_id = u.id";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching posts.");
    } else {
      res.json(results);
    }
  });
});

app.get("/posts/:id", (req, res) => {
  const query =
    "SELECT p.id, p.user_id, u.name AS user_name, u.image_url AS user_image_url, p.description, p.image_url, p.created_at FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching post.");
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send("Post not found.");
      }
    }
  });
});

app.get("/posts/user/:userId", (req, res) => {
  const query =
    "SELECT p.id, p.user_id, u.name AS user_name, u.image_url AS user_image_url, p.description, p.image_url, p.created_at FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?";
  db.query(query, [req.params.userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching posts.");
    } else {
      res.json(results);
    }
  });
});

app.post("/posts", (req, res) => {
  const { user_id, description, image_url } = req.body;
  const query =
    "INSERT INTO posts (user_id, description, image_url) VALUES (?, ?, ?)";
  const values = [user_id, description, image_url];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while creating post.");
    } else {
      const postId = result.insertId;
      const selectQuery =
        "SELECT p.id, p.user_id, u.name AS user_name, u.image_url AS user_image_url, p.description, p.image_url, p.created_at FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?";
      db.query(selectQuery, [postId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while fetching post.");
        } else {
          res.status(201).json(results[0]);
        }
      });
    }
  });
});

app.get("/comments", (req, res) => {
  const query =
    "SELECT c.id, c.post_id, c.user_id, u.name AS user_name, u.image_url AS user_image_url, c.text, c.created_at FROM comments c JOIN users u ON c.user_id = u.id";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching comments.");
    } else {
      res.json(results);
    }
  });
});

app.get("/comments/:id", (req, res) => {
  const query =
    "SELECT c.id, c.post_id, c.user_id, u.name AS user_name, u.image_url AS user_image_url, c.text, c.created_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching comment.");
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send("Comment not found.");
      }
    }
  });
});

app.get("/comments/post/:postId", (req, res) => {
  const query =
    "SELECT c.id, c.post_id, c.user_id, u.name AS user_name, u.image_url AS user_image_url, c.text, c.created_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ?";
  db.query(query, [req.params.postId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching comments.");
    } else {
      res.json(results);
    }
  });
});

app.post("/comments", (req, res) => {
  const { post_id, user_id, text } = req.body;
  const query =
    "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)";
  const values = [post_id, user_id, text];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while creating comment.");
    } else {
      const commentId = result.insertId;
      const selectQuery =
        "SELECT c.id, c.post_id, c.user_id, u.name AS user_name, u.image_url AS user_image_url, c.text, c.created_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?";
      db.query(selectQuery, [commentId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while fetching comment.");
        } else {
          res.status(201).json(results[0]);
        }
      });
    }
  });
});

app.delete("/comments/:id", (req, res) => {
  const query = "DELETE FROM comments WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while deleting comment.");
    } else {
      res.status(204).send();
    }
  });
});

app.delete("/posts/:id", (req, res) => {
  const query = "DELETE FROM posts WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while deleting post.");
    } else {
      res.status(204).send();
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});