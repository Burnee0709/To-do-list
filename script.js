import { addIcon, editIcon, editSquareIcon } from "./icons.js";
import { getTaskStructure } from "./structures.js";

const input = document.querySelector("input");
const form = document.querySelector("form");
const taskListContainer = document.querySelector("#task-list");
const taskSummary = document.getElementById("task-summary");
const progress = document.getElementById("progress");
const submitTaskButton = document.querySelector("#submit-task");
const microphone = document.getElementById("microphone");

let tasks = [];

document.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("tasks"));

  if (storedTasks) {
    tasks = storedTasks;
    updateTaskList();
    updateStats();
  }

  const recognition = setUpSpeechRecognition();

  microphone.addEventListener("click", () => {
    recognition.start();
    input.classList.add("active");
  });

  recognition.addEventListener("end", () => {
    recognition.stop();
    input.classList.remove("active");
  });

  recognition.addEventListener("result", (e) => {
    const speechToText = e.results[0][0].transcript;
    input.value = speechToText;
  });
  form.addEventListener("submit", submitForm);
});

const submitForm = (e) => {
  e.preventDefault();

  const text = input.value.trim();

  if (!text) return;

  const editingTask = tasks.find((task) => task.editing);

  if (editingTask) {
    editingTask.text = text;
    editingTask.editing = false;
    submitTaskButton.innerHTML = addIcon;
  } else {
    tasks.push({ text, completed: false, editing: false });
  }

  form.reset();
  updateTaskList();
  updateStats();
  saveTasks();
};

const updateTaskList = () => {
  taskListContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    const completedClass = task.completed ? "completed" : "";
    const editingClass = task.editing ? "editing" : "";
    li.className = `task ${completedClass} ${editingClass}`;
    li.innerHTML = getTaskStructure(task, index);

    const checkbox = li.querySelector(".checkbox");
    checkbox.addEventListener("change", () => toggleTaskCompleted(index));

    const editbutton = li.querySelector(".edit");
    editbutton.addEventListener("click", () => editTask(index));
    const deleteButton = li.querySelector(".delete");
    deleteButton.addEventListener("click", () => deleteTask(index));

    taskListContainer.appendChild(li);
  });
};

const toggleTaskCompleted = (index) => {
  const selectedTask = tasks[index];

  selectedTask.completed = !selectedTask.completed;
  updateTaskList();
  updateStats();
};
const editTask = (index) => {
  tasks.forEach((task) => (task.editing = false));

  const selectedTask = tasks[index];
  selectedTask.editing = true;

  input.value = selectedTask.text;
  submitTaskButton.innerHTML = editIcon;

  updateTaskList();
};
const deleteTask = (index) => {
  tasks.splice(index, 1);
  updateTaskList();
  updateStats();
};
const updateStats = () => {
  const completedTasks = tasks.filter((task) => task.completed);
  const totalCompletedTasks = completedTasks.length;
  const totalTasks = tasks.length;
  const completlionPercentlage = (totalCompletedTasks / totalTasks) * 100 || 0;
  progress.style.width = `${completlionPercentlage}%`;
  taskSummary.textContent = `${totalCompletedTasks} /  ${totalTasks}`;
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
const setUpSpeechRecognition = () => {
  const SpeechReconition =
    window.SpeechRecognition || window.webkitSpeechRecgnition;
  const recognition = new SpeechReconition();
  recognition.lang = "en-US";

  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
};
