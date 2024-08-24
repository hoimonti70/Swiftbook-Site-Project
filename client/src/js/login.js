const handleLogin = async (e) => {
  console.log("Form submission detected!"); // Debugging log
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch("http://localhost:3001/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Data:", data);

    if (response.ok) {
      // Assuming the server returns user data upon successful login
      localStorage.setItem("current_user", JSON.stringify(data)); // Save user data as a string

      // Redirect to the dashboard
      window.location.href = "pages/dashboard.html";
    } else {
      document.getElementById("error-message").textContent = data.message;
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("error-message").textContent =
      "Login failed. Please try again.";
  }
};

// Ensure the correct form ID is used
document.getElementById("login-form").addEventListener("submit", handleLogin);
