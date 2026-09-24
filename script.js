const questions = [
  { type: "single", category: "INDIA · BASICS", accent: "#ff806b", prompt: "What is the capital of India?", hint: "Pick one answer.", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], answer: "New Delhi" },
  { type: "multiple", category: "INDIA · GEOGRAPHY", accent: "#68d8d6", prompt: "Which of these are Indian states?", hint: "Select all that apply.", options: ["Kerala", "Punjab", "Nepal", "Rajasthan"], answer: ["Kerala", "Punjab", "Rajasthan"] },
  { type: "blank", category: "INDIA · SYMBOLS", accent: "#ffbd59", prompt: "What is the national animal of India?", hint: "Type the animal's name.", answer: ["tiger", "bengal tiger", "royal bengal tiger"] },
  { type: "single", category: "INDIA · LANDMARKS", accent: "#a58cff", prompt: "In which city is the Taj Mahal located?", hint: "Pick one answer.", options: ["Agra", "Jaipur", "Lucknow", "Bhopal"], answer: "Agra" },
  { type: "multiple", category: "INDIA · CULTURE", accent: "#9bff77", prompt: "Which of these are Indian festivals?", hint: "Select all that apply.", options: ["Diwali", "Holi", "Oktoberfest", "Onam"], answer: ["Diwali", "Holi", "Onam"] },
  { type: "blank", category: "INDIA · HISTORY", accent: "#71a9ff", prompt: "Who is popularly known as the Father of the Nation in India?", hint: "Type the person's name.", answer: ["mahatma gandhi", "gandhi", "mohandas karamchand gandhi"] },
  { type: "single", category: "INDIA · NATURE", accent: "#f0d95b", prompt: "Which is the longest river in India?", hint: "Pick one answer.", options: ["Ganga", "Yamuna", "Godavari", "Narmada"], answer: "Ganga" },
  { type: "multiple", category: "INDIA · SPORTS", accent: "#ff9bcf", prompt: "Which of these sports are popular in India?", hint: "Select all that apply.", options: ["Cricket", "Kabaddi", "Baseball", "Hockey"], answer: ["Cricket", "Kabaddi", "Hockey"] }
];

const welcomeView = document.querySelector("#welcome-view");
const quizView = document.querySelector("#quiz-view");
const resultView = document.querySelector("#result-view");
const answerArea = document.querySelector("#answer-area");
const nextButton = document.querySelector("#next-button");
const selectionStatus = document.querySelector("#selection-status");
const timerValue = document.querySelector("#timer-value");
const timer = document.querySelector("#timer");
const QUESTION_TIME = 30;
document.querySelectorAll("[data-total-questions]").forEach((element) => { element.textContent = String(questions.length).padStart(2, "0"); });
let currentIndex = 0;
let score = 0;
let attempted = 0;
let timerId;
let timeRemaining = QUESTION_TIME;
let selection = [];

function showView(view) {
  [welcomeView, quizView, resultView].forEach((item) => { item.hidden = item !== view; });
}

function renderQuestion() {
  const question = questions[currentIndex];
  selection = question.type === "multiple" ? [] : "";
  quizView.style.setProperty("--question-accent", question.accent);
  document.querySelector("#question-counter").textContent = `QUESTION ${String(currentIndex + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`;
  document.querySelector("#question-number").textContent = String(currentIndex + 1).padStart(2, "0");
  document.querySelector("#question-type").textContent = question.type === "blank" ? "TYPE IN" : question.type.toUpperCase();
  document.querySelector("#question-category").textContent = question.category;
  document.querySelector("#question-title").textContent = question.prompt;
  document.querySelector("#question-hint").textContent = question.hint;
  document.querySelector("#progress-bar").style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  document.querySelector("#live-score").textContent = String(score).padStart(2, "0");
  nextButton.disabled = true;
  selectionStatus.textContent = question.type === "multiple" ? "Choose one or more" : "Choose an answer to continue";
  answerArea.innerHTML = "";
  startTimer();

  if (question.type === "blank") {
    const input = document.createElement("input");
    input.className = "text-answer";
    input.type = "text";
    input.placeholder = "Your answer...";
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Type your answer");
    input.addEventListener("input", () => { selection = input.value.trim(); updateReadyState(); });
    input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !nextButton.disabled) nextButton.click(); });
    answerArea.append(input);
    input.focus();
    return;
  }

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = `answer-option ${question.type}`;
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<span class="option-marker">${question.type === "multiple" ? "" : String.fromCharCode(65 + index)}</span><span>${option}</span>`;
    button.addEventListener("click", () => chooseOption(option, button));
    answerArea.append(button);
  });
}

function updateTimer() {
  timerValue.textContent = String(timeRemaining).padStart(2, "0");
  timer.classList.toggle("timer-warning", timeRemaining <= 10);
  timer.classList.toggle("timer-danger", timeRemaining <= 5);
}

function startTimer() {
  clearInterval(timerId);
  timeRemaining = QUESTION_TIME;
  updateTimer();
  timerId = setInterval(() => {
    timeRemaining -= 1;
    updateTimer();
    if (timeRemaining <= 0) {
      clearInterval(timerId);
      selectionStatus.textContent = "Time's up — counted as wrong";
      advanceQuestion();
    }
  }, 1000);
}

function chooseOption(option, button) {
  if (Array.isArray(selection)) {
    selection = selection.includes(option) ? selection.filter((item) => item !== option) : [...selection, option];
    button.classList.toggle("selected", selection.includes(option));
  } else {
    selection = option;
    document.querySelectorAll(".answer-option").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    document.querySelectorAll(".answer-option").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  }
  if (Array.isArray(selection)) button.setAttribute("aria-pressed", String(selection.includes(option)));
  updateReadyState();
}

function updateReadyState() {
  const ready = Array.isArray(selection) ? selection.length > 0 : selection.length > 0;
  nextButton.disabled = !ready;
  selectionStatus.textContent = ready ? (currentIndex === questions.length - 1 ? "Ready to finish" : "Answer locked in") : (questions[currentIndex].type === "multiple" ? "Choose one or more" : "Choose an answer to continue");
}

function isCorrect(question) {
  if (question.type === "multiple") {
    return Array.isArray(selection) && selection.length === question.answer.length && selection.every((item) => question.answer.includes(item));
  }
  const acceptedAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
  return acceptedAnswers.some((answer) => String(answer).toLowerCase() === String(selection).toLowerCase());
}

function showResults() {
  clearInterval(timerId);
  const percentage = Math.round((score / questions.length) * 100);
  const message = percentage === 100 ? "perfect signal." : percentage >= 67 ? "sharp thinking." : percentage >= 34 ? "good instincts." : "keep tuning in.";
  document.querySelector("#final-score").textContent = String(score).padStart(2, "0");
  document.querySelector("#result-message").textContent = message;
  document.querySelector("#result-summary").textContent = `You got ${score} out of ${questions.length} right (${percentage}%). Every answer is a useful data point. Take another pass and see what changes.`;
  document.querySelector("#result-bar-fill").style.width = `${percentage}%`;
  document.querySelector("#attempted-score").textContent = String(attempted).padStart(2, "0");
  document.querySelector("#correct-score").textContent = String(score).padStart(2, "0");
  document.querySelector("#wrong-score").textContent = String(attempted - score).padStart(2, "0");
  showView(resultView);
}

function advanceQuestion() {
  attempted += 1;
  if (isCorrect(questions[currentIndex])) score += 1;
  currentIndex += 1;
  currentIndex < questions.length ? renderQuestion() : showResults();
}

document.querySelector("#start-button").addEventListener("click", () => { currentIndex = 0; score = 0; attempted = 0; showView(quizView); renderQuestion(); });
nextButton.addEventListener("click", advanceQuestion);
document.querySelector("#restart-button").addEventListener("click", () => { currentIndex = 0; score = 0; attempted = 0; showView(quizView); renderQuestion(); });
document.querySelector("#home-button").addEventListener("click", () => { clearInterval(timerId); showView(welcomeView); });