const apiEndpoint = 'https://crudcrud.com/api/f3fca9fb7eb942a28758ed07c3779827/feedbacks';
let ratingsCount = [0, 0, 0, 0, 0];
let feedbacks = [];
let editingFeedbackId = null;

// Fetch initial data from the server
fetch(apiEndpoint)
  .then(response => response.json())
  .then(data => {
    feedbacks = data;
    feedbacks.forEach(feedback => ratingsCount[feedback.rating - 1]++);
    updateOverallRatings();
    renderFeedbacks();
  })
  .catch(error => console.error('Error fetching data:', error));

function handleFormSubmit(event) {
  event.preventDefault();
  const feedbackDetails = {
    name: event.target.name.value,
    rating: parseInt(event.target.rating.value)
  };

  if (editingFeedbackId) {
    // If editing, delete the old feedback and then add the updated feedback
    deleteFeedback(editingFeedbackId, () => {
      postFeedback(feedbackDetails);
      editingFeedbackId = null;
    });
  } else {
    // If not editing, just add the new feedback
    postFeedback(feedbackDetails);
  }

  // Clearing the input fields
  document.getElementById("name").value = "";
  document.getElementById("rating").value = "1";
}

function postFeedback(feedbackDetails) {
  fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(feedbackDetails)
  })
    .then(response => response.json())
    .then(data => {
      feedbacks.push(data);
      ratingsCount[feedbackDetails.rating - 1]++;
      updateOverallRatings();
      renderFeedbacks();
    })
    .catch(error => console.error('Error submitting feedback:', error));
}

function deleteFeedback(id, callback) {
  fetch(`${apiEndpoint}/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      feedbacks = feedbacks.filter(feedback => feedback._id !== id);
      const feedback = feedbacks.find(fb => fb._id === id);
      if (feedback) {
        ratingsCount[feedback.rating - 1]--;
        updateOverallRatings();
      }
      renderFeedbacks();
      if (callback) callback();
    })
    .catch(error => console.error('Error deleting feedback:', error));
}

function editFeedback(id) {
  const feedback = feedbacks.find(fb => fb._id === id);
  if (feedback) {
    document.getElementById('name').value = feedback.name;
    document.getElementById('rating').value = feedback.rating;
    editingFeedbackId = id;
  }
}

function updateOverallRatings() {
  const ratings = document.querySelector('.ratings');
  ratings.innerHTML = `
    <p>★ ${ratingsCount[0]}</p>
    <p>★★ ${ratingsCount[1]}</p>
    <p>★★★ ${ratingsCount[2]}</p>
    <p>★★★★ ${ratingsCount[3]}</p>
    <p>★★★★★ ${ratingsCount[4]}</p>
  `;
}

function renderFeedbacks() {
  const feedbackList = document.getElementById('feedback-list');
  feedbackList.innerHTML = '';

  feedbacks.forEach(feedback => {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.innerHTML = `
      <p><strong>${feedback.name}</strong> (${feedback.rating} stars)</p>
      <button class="edit" onclick="editFeedback('${feedback._id}')">Edit</button>
      <button class="delete" onclick="deleteFeedback('${feedback._id}')">Delete</button>
    `;
    feedbackList.appendChild(feedbackItem);
  });
}