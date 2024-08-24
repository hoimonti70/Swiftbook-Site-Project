// Retrieve user information from localStorage
function getUserInfo() {
  const userData = localStorage.getItem("current_user");

  if (userData) {
    try {
      const user = JSON.parse(userData);

      // Check if the user ID exists
      if (user.id) {
        return user;
      } else {
        // Redirect to login if the user ID is missing
        redirectToLogin();
      }
    } catch (error) {
      console.error("Error parsing userData:", error);
      redirectToLogin(); // Redirect if there is an error parsing the data
    }
  } else {
    redirectToLogin(); // Redirect if no user data is found
  }

  return null;
}

// Redirect to the login page
function redirectToLogin() {
  window.location.href = "../index.html";
}

// Display user information on the dashboard
function displayUserInfo() {
  const userInfo = getUserInfo();

  if (userInfo) {
    document.getElementById("user-name").textContent = userInfo.name;
    document.getElementById("user-name-display").textContent = userInfo.name;
    document.getElementById("user-email").textContent = userInfo.email;

    // Set user image if available
    if (userInfo.image_url) {
      document.getElementById("user-image").src = userInfo.image_url;
    } else {
      document.getElementById("user-image").src =
        "../images/default-avatar.png";
    }
  } else {
    document.getElementById("user-info").textContent =
      "Failed to load user information.";
  }
}

// Handle logout process
function handleLogout() {
  localStorage.removeItem("current_user");
  window.location.href = "../index.html";
}

document.getElementById("logout-btn").addEventListener("click", handleLogout);

// Load user information on page load
displayUserInfo();
