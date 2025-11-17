import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11.22.3/+esm";

// ====== Select Buttons & Elements ======
const btnHtml = document.getElementById("html"); // HTML quiz button
const btnCss = document.getElementById("css"); // CSS quiz button
const btnJs = document.getElementById("js"); // JS quiz button
const parent = document.getElementById("quizs"); // Container of category buttons
const questionsBox = document.querySelector(".questions"); // Container for showing questions
const cloned = parent; // Keep a copy of category buttons for restart

// ====== State Variables ======
let correctAnswers = []; // Store correct answers from JSON
let userAnswers = []; // Store user-selected answers
let currentQuestion = 0; // Current question index
let timer; // Countdown timer

// ====== Escape HTML to prevent XSS ======
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ====== Category Button Click Events ======
btnHtml.onclick = () => {
  startQuiz("html"); // Start HTML quiz
  parent.remove(); // Remove category buttons
};
btnCss.onclick = () => {
  startQuiz("css");
  parent.remove();
};
btnJs.onclick = () => {
  startQuiz("javascript");
  parent.remove();
};

// ====== Start Quiz Function ======
function startQuiz(type) {
  fetch("./questions.json") // Fetch questions JSON
    .then((res) => res.json())
    .then((data) => {
      correctAnswers = [];
      userAnswers = [];
      currentQuestion = 0;

      // Save correct answers for scoring
      data[type].forEach((item) => {
        correctAnswers.push(item.answer);
      });

      showQuestion(data[type]); // Show first question
    })
    .catch((err) => console.error("Error:", err));
}

// ====== Show Question Function ======
function showQuestion(questions) {
  // If no more questions, finish the quiz
  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  const item = questions[currentQuestion];
  questionsBox.innerHTML = ""; // Clear previous question

  // Create options HTML
  const optionsHtml = item.options
    .map((opt) => `<div class="choose">${escapeHTML(opt)}</div>`)
    .join("");

  // Insert question and options into DOM
  questionsBox.innerHTML = `
        <div class="question">
            <h4><span class="mark">Question ${
              currentQuestion + 1
            }</span> ${escapeHTML(item.question)}</h4>
            ${optionsHtml}
            <div id="timer">⏳ 5</div>
        </div>
    `;

  // Select all options
  const choices = document.querySelectorAll(".choose");

  // ====== Option Click Event ======
  choices.forEach((choice) => {
    choice.onclick = (e) => {
      clearInterval(timer); // Stop countdown
      userAnswers[currentQuestion] = e.target.textContent.trim(); // Save answer
      currentQuestion++; // Move to next question
      showQuestion(questions); // Show next question
    };
  });

  // ====== Countdown Timer ======
  let timeLeft = 5;
  const timerDiv = document.getElementById("timer");

  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `⏳ ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      userAnswers[currentQuestion] = undefined; // Mark unanswered
      currentQuestion++;
      showQuestion(questions); // Show next question
    }
  }, 1000);
}

// ====== Finish Quiz & Show Result ======
function finishQuiz() {
  questionsBox.innerHTML = ""; // Clear questions

  // Calculate score
  let score = 0;
  userAnswers.forEach((ans, i) => {
    if (ans === correctAnswers[i]) score++;
  });

  const percent = (score / correctAnswers.length) * 100;

  // Show SweetAlert2 result
  if (percent >= 80) {
    Swal.fire({
      icon: "success",
      title: "Passed",
      text: `Score: ${score}/${correctAnswers.length} (${percent.toFixed(
        0
      )}%) ✅`,
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: `Score: ${score}/${correctAnswers.length} (${percent.toFixed(0)}%)`,
    });
  }

  // Restore category buttons for restart
  document.body.prepend(cloned);
}
