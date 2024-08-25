// Retrieve user information from localStorage
function getUserInfo() {
  const userData = localStorage.getItem("current_user");

  if (userData) {
    try {
      const user = JSON.parse(userData);

      if (user.id) {
        return user;
      } else {
        redirectToLogin();
      }
    } catch (error) {
      console.error("Error parsing userData:", error);
      redirectToLogin();
    }
  } else {
    redirectToLogin();
  }

  return null;
}

// Redirect to the login page
function redirectToLogin() {
  window.location.href = "login.html";
}

// Display user information on the dashboard
function displayUserInfo() {
  const userInfo = getUserInfo();

  if (userInfo) {
    document.getElementById("user-name").textContent = userInfo.name;
    document.getElementById("user-name-display").textContent = userInfo.name;
    document.getElementById("user-email").textContent = userInfo.email;

    if (userInfo.image_url) {
      document.getElementById("user-image").src = userInfo.image_url;
    } else {
      document.getElementById("user-image").src = "../assets/avatar.png";
    }
  } else {
    document.getElementById("user-info").textContent =
      "Failed to load user information.";
  }
}

// Handle logout process
function handleLogout() {
  localStorage.removeItem("current_user");
  window.location.href = "login.html";
}

function createPostElement(post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post");
  postElement.dataset.postId = post.id;

  const postTitle = document.createElement("h4");
  postTitle.textContent = post.description;

  const postImage = document.createElement("img");
  postImage.src = post.image_url;
  postImage.alt = "Post Image";
  postImage.classList.add("post-image");

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("edit-btn");
  editButton.addEventListener("click", () =>
    openEditPopup(post.id, post.description, post.image_url)
  );

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-btn");
  deleteButton.addEventListener("click", () => handleDeletePost(post.id));

  const userInfo = getUserInfo();
  if (userInfo && userInfo.id === post.user_id) {
    postElement.appendChild(editButton);
    postElement.appendChild(deleteButton);
  }

  postElement.appendChild(postTitle);
  postElement.appendChild(postImage);

  return postElement;
}

// Function to load and display user's posts
function displayUserPosts() {
  const userInfo = getUserInfo();
  if (userInfo) {
    fetch(`http://localhost:3001/posts/user/${userInfo.id}`)
      .then((response) => response.json())
      .then((posts) => {
        const userPostsContainer = document.getElementById("user-posts");
        userPostsContainer.innerHTML = "";

        posts.forEach((post) => {
          const postElement = createPostElement(post);
          userPostsContainer.appendChild(postElement);
        });
      })
      .catch((error) => console.error("Error fetching user posts:", error));
  }
}

// Function to handle creating a new post
function handleCreatePost() {
  const userInfo = getUserInfo();
  if (userInfo) {
    const description = document.getElementById("post-description").value;
    const imageUrl = document.getElementById("post-image").value;

    if (description.trim()) {
      fetch("http://localhost:3001/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userInfo.id,
          description: description,
          image_url: imageUrl,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          displayUserPosts();
          document.getElementById("post-description").value = "";
          document.getElementById("post-image").value = "";
        })
        .catch((error) => console.error("Error creating post:", error));
    }
  }
}

function openEditPopup(postId, currentDescription, currentImageUrl) {
  const editPopup = document.getElementById("edit-popup");
  const editDescriptionInput = document.getElementById("edit-description");
  const editImageInput = document.getElementById("edit-image");
  const saveEditButton = document.getElementById("edit-form-submit");

  // Set current values to the input fields
  editDescriptionInput.value = currentDescription;
  editImageInput.value = currentImageUrl; // Set the current image URL

  // Store the post ID in a hidden field for later use
  document.getElementById("edit-post-id").value = postId;

  // Show the popup
  editPopup.style.display = "block";

  // Set the event listener for the save button
  (saveEditButton.onclick = () => handleEditPost(postId)), displayUserPosts();
}

function handleEditPost(postId) {
  const userInfo = getUserInfo();
  if (userInfo) {
    const postDescription = document.getElementById("edit-description").value;
    const postImageUrl = document.getElementById("edit-image").value;

    if (postDescription.trim()) {
      fetch(`http://localhost:3001/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: postDescription,
          image_url: postImageUrl, // Update image URL if needed
        }),
      })
        .then((response) => response.json())
        .then(() => {
          displayUserPosts();
          closeEditPopup();
        })
        .catch((error) => console.error("Error editing post:", error));
    }
  }
  window.location.reload();
}

// Function to close the edit popup
function closeEditPopup() {
  document.getElementById("edit-popup").style.display = "none";
  displayUserPosts();
}

// Function to handle deleting a post
function handleDeletePost(postId) {
  const userInfo = getUserInfo();
  if (userInfo) {
    if (confirm("Are you sure you want to delete this post?")) {
      fetch(`http://localhost:3001/posts/${postId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then(() => {
          displayUserPosts();
        })
        .catch((error) => console.error("Error deleting post:", error));
    }
  }
  displayUserPosts();
  window.location.reload();
}

// Load user information and posts on page load
displayUserInfo();
displayUserPosts();

// Add event listener for logout
document.getElementById("logout-btn").addEventListener("click", handleLogout);

// Add event listener for creating a new post
document
  .getElementById("post-submit")
  .addEventListener("click", handleCreatePost);

// Add event listener for closing the edit popup
document
  .getElementById("close-edit-popup-btn")
  .addEventListener("click", closeEditPopup);
