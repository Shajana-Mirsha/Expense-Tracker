let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let capturedImage = null;
let stream = null;

/* CATEGORY HANDLING */
function handleOtherCategory() {
  const categorySelect = document.getElementById("category");
  const otherInput = document.getElementById("otherText");

  const selected = categorySelect.value.trim(); // 🔥 TRIM

  if (selected.toLowerCase() === "others") {
    otherInput.style.display = "block";
    updateBackgroundByCategory(otherInput.value || "other");
  } else {
    otherInput.style.display = "none";
    updateBackgroundByCategory(selected);
  }
}




/* CAMERA */
function openCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      document.getElementById("video").srcObject = stream;
      document.getElementById("cameraModal").style.display = "flex";
    })
    .catch(() => alert("Camera access denied"));
}

function capturePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  capturedImage = canvas.toDataURL("image/png"); // ✅ image locked to next expense
  closeCamera();
}

function closeCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  document.getElementById("cameraModal").style.display = "none";
}

/* ADD EXPENSE */
function addExpense() {
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const descInput = document.getElementById("desc");
  const otherInput = document.getElementById("otherText");
  const dateInput = document.getElementById("date");

  const amount = Number(amountInput.value);
  let category = categorySelect.value;
  const desc = descInput.value;
  const date = dateInput.value;

  if (!amount || !desc || !date) {
    alert("Please fill all fields");
    return;
  }

  if (category === "others" && otherInput.value) {
    category = otherInput.value;
  }

  expenses.push({
    amount,
    category,
    desc,
    date,          // ✅ SAVE DATE
    image: capturedImage
  });

  // RESET
  amountInput.value = "";
  descInput.value = "";
  categorySelect.value = "food";
  otherInput.value = "";
  otherInput.style.display = "none";
  dateInput.value = new Date().toISOString().split("T")[0];
  capturedImage = null;

  updateBackgroundByCategory("food");
  save();
}


/* DELETE */
function deleteExpense(index) {
  expenses.splice(index, 1);
  save();
}

/* SAVE + RENDER */
function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

function render() {
  let total = 0;
  let sums = { food: 0, travel: 0, shopping: 0, others: 0 };


  const list = document.getElementById("list");
  list.innerHTML = "";

  const filterDate = document.getElementById("filterDate").value;

  expenses
    .filter(e => !filterDate || e.date === filterDate) // ✅ HISTORY FILTER
    .forEach((e, i) => {
      total += e.amount;

      const cat = e.category.toLowerCase();

if (sums[cat] !== undefined) {
  sums[cat] += e.amount;
} else {
  sums.others += e.amount;
}

      list.innerHTML += `
        <li>
          <div>
            ₹${e.amount} - ${e.category}<br>
            <small>${e.desc}</small><br>
            <small>${e.date}</small>
          </div>
          ${e.image ? `<img src="${e.image}">` : ""}
          <button class="delete-btn" onclick="deleteExpense(${i})">Delete</button>
        </li>
      `;
    });

  document.getElementById("total").innerText = total;
  
}




/* TOOLTIP */
function showTooltip(e, name) {
  const total = expenses.reduce((s, x) => s + x.amount, 0);
  const value = expenses
    .filter(x =>
      name === "Others"
        ? !["Food","Travel","Shopping"].includes(x.category)
        : x.category === name
    )
    .reduce((s, x) => s + x.amount, 0);

  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = `${name}<br>₹${value} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`;
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
  tooltip.style.display = "block";
}

function hideTooltip() {
  document.getElementById("tooltip").style.display = "none";
}
function updateBackgroundByCategory(category) {
  const bg = document.querySelector(".background");
  if (!bg) return;

  // 🔥 NORMALIZE INPUT (THIS IS THE FIX)
  const key = category.trim().toLowerCase();

  let url;

  if (key === "food") {
    url = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80";
  } 
  else if (key === "travel") {
    url = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";
  } 
  else if (key === "shopping") {
  url = "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80";
}

  else {
    // Others / custom text (gym, movie, etc.)
    url = "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1600&q=80";
  }

  const img = new Image();
img.onload = () => {
  bg.style.backgroundImage = `url("${url}")`;
};
img.src = url;

}



// Set default background on load
window.addEventListener("DOMContentLoaded", () => {
  const otherInput = document.getElementById("otherText");

  otherInput.addEventListener("input", (e) => {
    if (document.getElementById("category").value === "Others") {
      updateBackgroundByCategory(e.target.value || "other");
    }
  });

  // Set default background
  updateBackgroundByCategory("Food");
  document.getElementById("category").addEventListener("change", handleOtherCategory);
  const today = new Date().toISOString().split("T")[0];
document.getElementById("date").value = today;
document.getElementById("filterDate").value = today;

});



render();
