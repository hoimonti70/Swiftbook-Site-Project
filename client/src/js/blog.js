document.addEventListener("DOMContentLoaded", function () {
  const blogPostsContainer = document.getElementById("blog-posts");

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

    postElement.appendChild(userElement);
    postElement.appendChild(postDescription);
    postElement.appendChild(postImage);
    postElement.appendChild(postDate);
    postElement.appendChild(commentsContainer);

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
