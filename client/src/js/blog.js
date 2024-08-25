// Function to redirect to login page
function redirectToLogin() {
  window.location.href = "login.html";
}

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

document.addEventListener("DOMContentLoaded", function () {
  const blogPostsContainer = document.getElementById("blog-posts");
  const userInfo = getUserInfo(); // Retrieve the user info from localStorage

  // Function to create a blog post element
  function createBlogPostElement(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("blog-post");

    const userElement = document.createElement("div");
    userElement.classList.add("user-info");

    const userImage = document.createElement("img");
    userImage.src = post.user_image_url;
    userImage.alt = `${post.user_name}'s profile picture`;
    userImage.classList.add("user-image");

    const userName = document.createElement("p");
    userName.textContent = post.user_name;
    userName.classList.add("user-name");

    userElement.appendChild(userImage);
    userElement.appendChild(userName);

    const postDescription = document.createElement("p");
    postDescription.textContent = post.description;
    postDescription.classList.add("post-description");

    const postImage = document.createElement("img");
    postImage.src = post.image_url;
    postImage.alt = "Blog post image";
    postImage.classList.add("post-image");

    const postDate = document.createElement("p");
    postDate.textContent = new Date(post.created_at).toLocaleString();
    postDate.classList.add("post-date");

    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("comments-container");

    // Fetch and display comments for each post
    fetch(`http://localhost:3001/comments/post/${post.id}`)
      .then((response) => response.json())
      .then((comments) => {
        comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          commentElement.classList.add("comment");

          const commentUser = document.createElement("div");
          commentUser.classList.add("comment-user");

          const commentUserImage = document.createElement("img");
          commentUserImage.src = comment.user_image_url;
          commentUserImage.alt = `${comment.user_name}'s profile picture`;
          commentUserImage.classList.add("comment-user-image");

          const commentUserName = document.createElement("p");
          commentUserName.textContent = comment.user_name;
          commentUserName.classList.add("comment-user-name");

          commentUser.appendChild(commentUserImage);
          commentUser.appendChild(commentUserName);

          const commentText = document.createElement("p");
          commentText.textContent = comment.text;
          commentText.classList.add("comment-text");

          commentElement.appendChild(commentUser);
          commentElement.appendChild(commentText);
          commentsContainer.appendChild(commentElement);
        });
      })
      .catch((error) => console.error("Error fetching comments:", error));

    // Add comment form
    const addCommentForm = document.createElement("div");
    addCommentForm.classList.add("add-comment");

    const commentInput = document.createElement("input");
    commentInput.type = "text";
    commentInput.placeholder = "Add a comment...";
    commentInput.classList.add("comment-input");

    const submitButton = document.createElement("button");
    submitButton.textContent = "Post";
    submitButton.classList.add("comment-submit");

    // Handle comment submission
    submitButton.addEventListener("click", function () {
      const commentText = commentInput.value;
      if (commentText.trim() && userInfo) {
        // Post the comment to the server using userInfo and post ID
        fetch(`http://localhost:3001/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.id, // Use the post ID
            user_id: userInfo.id, // Use the user ID from localStorage
            user_name: userInfo.name, // Use the user name from localStorage
            user_image_url: userInfo.image_url, // Use the user image URL from localStorage
            text: commentText,
          }),
        })
          .then((response) => response.json())
          .then((newComment) => {
            // Add the new comment to the comments container
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment");

            const commentUser = document.createElement("div");
            commentUser.classList.add("comment-user");

            const commentUserImage = document.createElement("img");
            commentUserImage.src = newComment.user_image_url;
            commentUserImage.alt = `${newComment.user_name}'s profile picture`;
            commentUserImage.classList.add("comment-user-image");

            const commentUserName = document.createElement("p");
            commentUserName.textContent = newComment.user_name;
            commentUserName.classList.add("comment-user-name");

            commentUser.appendChild(commentUserImage);
            commentUser.appendChild(commentUserName);

            const commentTextElement = document.createElement("p");
            commentTextElement.textContent = newComment.text;
            commentTextElement.classList.add("comment-text");

            commentElement.appendChild(commentUser);
            commentElement.appendChild(commentTextElement);
            commentsContainer.appendChild(commentElement);

            // Clear the input field
            commentInput.value = "";
          })
          .catch((error) => console.error("Error posting comment:", error));
      }
    });

    addCommentForm.appendChild(commentInput);
    addCommentForm.appendChild(submitButton);

    postElement.appendChild(userElement);
    postElement.appendChild(postDescription);
    postElement.appendChild(postImage);
    postElement.appendChild(postDate);
    postElement.appendChild(commentsContainer);
    postElement.appendChild(addCommentForm); // Append the comment form here

    blogPostsContainer.appendChild(postElement);
  }

  // Fetch and display blog posts
  fetch("http://localhost:3001/posts")
    .then((response) => response.json())
    .then((posts) => {
      posts.forEach((post) => {
        createBlogPostElement(post);
      });
    })
    .catch((error) => console.error("Error fetching blog posts:", error));
});
