// --------------------- LocalStorage ---------------------
const STORAGE_KEY = "focusflow-tasks"; // Keep the key consistent

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    tasks = JSON.parse(data);
    renderTasks();
  }
}

// --------------------- Section Switching ---------------------
let currentFilter = "all";

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".task-filters button").forEach(btn =>
    btn.classList.toggle("active", btn.id === `filter-${filter}`)
  );
  renderTasks();
}

const sections = {
  "home-section": document.getElementById("home-section"),
  "tasks-section": document.getElementById("tasks-section"),
  "focus-section": document.getElementById("focus-section"),
  "dashboard-section": document.getElementById("dashboard-section")
  
};


const navButtons = document.querySelectorAll(".nav-links button");

// Show a section and hide others, update nav active class
function showSection(sectionId) {
  // Hide all sections
  Object.values(sections).forEach(sec => {
    if (sec) sec.style.display = "none";
  });

  // Show the chosen section
  if (sections[sectionId]) {
    sections[sectionId].style.display = "block";
  }

  // Update nav active state
  navButtons.forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("onclick")?.includes(sectionId)
    );
  });
}


// --------------------- Task Logic ---------------------
let tasks = [];
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("task-title").value.trim();
  const subject = document.getElementById("task-subject").value;
  const priority = document.getElementById("task-priority").value;
  const deadline = document.getElementById("task-deadline").value;
  const duration = document.getElementById("task-duration").value;

  if (!title || !subject || !priority || !deadline || !duration) return;

  const newTask = {
    id: Date.now(),
    title,
    subject,
    priority,
    deadline,
    duration,
    completed: false
  };

  tasks.push(newTask);
  saveTasksToStorage();
  renderTasks();
  taskForm.reset();
});

// Render all tasks
function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasks.filter(task => {
    if (currentFilter === "all") return true;
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
  });

  if (filtered.length === 0) {
    taskList.innerHTML = "<p>No tasks to display.</p>";
    return;
  }

  filtered.forEach(task => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card " + task.priority.toLowerCase();
    if (task.completed) taskCard.classList.add("completed");

    taskCard.innerHTML = `
      <div>
        <h3>${task.title}</h3>
        <p class="meta">📚 ${task.subject} | ⏱️ ${task.duration} min | 🗓️ ${task.deadline}</p>
        <p class="meta">Priority: <strong>${task.priority}</strong></p>
      </div>
      <div>
        ${!task.completed
          ? `<button onclick="completeTask(${task.id})" style="background-color:#27ae60;color:white;margin-right:8px;">Complete</button>`
          : ''
        }
        <button onclick="deleteTask(${task.id})" style="background-color:#E74C3C; color:white;">Delete</button>
      </div>
    `;

    taskList.appendChild(taskCard);
  });

  updateDashboard();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasksToStorage();
  renderTasks();
}

// Complete task
function completeTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    saveTasksToStorage();
    renderTasks();
  }
}

// --------------------- Timer ---------------------
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');
const resetBtn = document.getElementById('reset-timer');

let timerDuration = 25 * 60; // 25 minutes
let timerInterval = null;
let timeLeft = timerDuration;
let isRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function timerTick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    clearInterval(timerInterval);
    isRunning = false;
    alert('Time is up! Take a short break or start a new session.');
    startBtn.disabled = false;
  }
}

startBtn.addEventListener('click', () => {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  resetBtn.disabled = false;
  timerInterval = setInterval(timerTick, 1000);
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timeLeft = timerDuration;
  updateDisplay();
  isRunning = false;
  startBtn.disabled = false;
  resetBtn.disabled = true;
});

// --------------------- Dashboard ---------------------
function updateDashboard() {
  const totalPending = tasks.filter(task => !task.completed).length;
  const completed = tasks.filter(task => task.completed).length;
  const high = tasks.filter(task => task.priority === "High").length;
  const medium = tasks.filter(task => task.priority === "Medium").length;
  const low = tasks.filter(task => task.priority === "Low").length;

  const dueSoon = tasks.filter(task => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
    return !task.completed && diffDays <= 3 && diffDays >= 0;
  }).length;

  const totalDuration = tasks.reduce((total, task) => {
    return !task.completed ? total + parseInt(task.duration) : total;
  }, 0);

  document.getElementById("total-tasks").textContent = totalPending;
  document.getElementById("completed-tasks").textContent = completed;
  document.getElementById("completed-count").textContent = completed;
  document.getElementById("high-priority").textContent = high;
  document.getElementById("medium-priority").textContent = medium;
  document.getElementById("low-priority").textContent = low;
  document.getElementById("due-soon").textContent = dueSoon;
  document.getElementById("total-duration").textContent = totalDuration;
}

// --------------------- Motivation Cards ---------------------
function generateMotivationCards() {
  const carousel = document.getElementById('motivation-carousel');
  const quotes = [
    "Stay focused, stay determined.",
    "Every step counts!",
    "You are capable of amazing things.",
    "Push through the hard times.",
    "Discipline outperforms motivation.",
    "Keep going, you're almost there.",
    "Progress over perfection.",
    "Focus. Breathe. Achieve.",
    "Study smart, not hard.",
    "Success is built on consistency.",
    "Small steps lead to big change.",
    "Dream big. Study bigger.",
    "Be proud of every small win.",
    "Hard work beats talent.",
    "The grind brings the shine."
  ];

  const repeatCount = 3;
  for (let i = 0; i < repeatCount; i++) {
    quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'motivation-card';
      card.innerText = quote;
      carousel.appendChild(card);
    });
  }
}

// --------------------- Init ---------------------
document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromStorage();
  updateDisplay();
  resetBtn.disabled = true;
  generateMotivationCards();
  showSection("tasks-section"); // default section
});
