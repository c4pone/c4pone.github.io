import { SIZE, DIRECTIONS, createGame, turn, step } from "./snake.mjs";

const $ = (selector) => document.querySelector(selector);
const playground = $(".playground");
const canvas = $("#snake");
const ctx = canvas.getContext("2d");
const overlay = $("#game-overlay");
const play = $("#play");
const pause = $("#pause");
const message = $("#game-message");
const directionButtons = [...document.querySelectorAll("[data-direction]")];
let game = createGame();
let timer = 0;
let swipe = null;

function draw() {
  const cell = canvas.width / SIZE;
  ctx.fillStyle = "#e0e7d3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = "#dbe3cc";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
  game.snake.forEach((part, index) => {
    ctx.fillStyle = index ? "#728c50" : "#344b2c";
    ctx.beginPath();
    ctx.roundRect(
      part.x * cell + 1,
      part.y * cell + 1,
      cell - 2,
      cell - 2,
      cell * 0.23,
    );
    ctx.fill();
  });
  const head = game.snake[0];
  const direction = DIRECTIONS[game.direction];
  const hx = (head.x + 0.5) * cell,
    hy = (head.y + 0.5) * cell;
  ctx.fillStyle = "#f5f5db";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      hx + (direction.x * 0.22 + direction.y * side * 0.21) * cell,
      hy + (direction.y * 0.22 + direction.x * side * 0.21) * cell,
      cell * 0.075,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  if (game.fruit) {
    const x = (game.fruit.x + 0.5) * cell,
      y = (game.fruit.y + 0.56) * cell;
    ctx.fillStyle = "#c86143";
    ctx.beginPath();
    ctx.ellipse(
      x - cell * 0.13,
      y,
      cell * 0.23,
      cell * 0.29,
      -0.2,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      x + cell * 0.13,
      y,
      cell * 0.23,
      cell * 0.29,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#526c3b";
    ctx.beginPath();
    ctx.ellipse(
      x + cell * 0.1,
      y - cell * 0.36,
      cell * 0.15,
      cell * 0.07,
      -0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#f5bd96";
    ctx.beginPath();
    ctx.arc(x - cell * 0.16, y - cell * 0.1, cell * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }
}

function update() {
  const running = game.status === "running";
  const paused = game.status === "paused";
  overlay.hidden = running;
  pause.disabled = !running && !paused;
  pause.innerHTML = paused
    ? 'Resume <span aria-hidden="true">▷</span>'
    : 'Pause <span aria-hidden="true">Ⅱ</span>';
  directionButtons.forEach((button) => {
    button.disabled = !running;
  });
  $("#score").textContent = String(game.score).padStart(3, "0");
  $("#score").setAttribute("aria-label", `Score: ${game.score}`);
  if (paused) {
    $("#game-kicker").textContent = "TAKE YOUR TIME";
    $("#overlay-title").textContent = "A little breather.";
    $("#overlay-description").textContent = "Your snake will be right here.";
    play.textContent = "Keep going →";
    message.textContent = "Paused. Press Space or Resume.";
  } else if (game.status === "over" || game.status === "won") {
    $("#game-kicker").textContent =
      game.status === "won"
        ? "EVERY APPLE. EVERY SQUARE."
        : "THERE’S ALWAYS ANOTHER ROUND";
    $("#overlay-title").textContent =
      game.status === "won" ? "You filled the board!" : "Nice run.";
    $("#overlay-description").textContent =
      `${game.score} points · ${game.score / 10} apples eaten`;
    play.textContent = "Play again ↻";
    message.textContent = `${game.status === "won" ? "You won!" : "Game over."} Score: ${game.score}.`;
  } else if (running) {
    message.textContent = game.score
      ? `${game.score / 10} apples eaten. Keep going!`
      : "Eat fruit. Avoid walls and your tail.";
  }
  draw();
}

function tick() {
  if (game.status !== "running") return;
  const previousScore = game.score;
  step(game);
  if (game.score !== previousScore || game.status !== "running") update();
  else draw();
  if (game.status === "running") schedule();
  else play.focus({ preventScroll: true });
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(tick, Math.max(100, 190 - game.score));
}
export function start() {
  if (!ctx) return;
  if (game.status !== "paused") game = createGame();
  game.status = "running";
  update();
  canvas.focus({ preventScroll: true });
  schedule();
}
function pauseGame() {
  if (game.status !== "running") return;
  clearTimeout(timer);
  game.status = "paused";
  update();
}
play.addEventListener("click", start);
pause.addEventListener("click", () => {
  if (game.status === "paused") start();
  else pauseGame();
});
directionButtons.forEach((button) =>
  button.addEventListener("click", () => turn(game, button.dataset.direction)),
);
const keys = {
  ArrowUp: "up",
  w: "up",
  ArrowRight: "right",
  d: "right",
  ArrowDown: "down",
  s: "down",
  ArrowLeft: "left",
  a: "left",
};
playground.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const direction = keys[event.key] || keys[event.key.toLowerCase()];
  if (direction && game.status === "running") {
    event.preventDefault();
    turn(game, direction);
  } else if (event.key === " " && event.target === canvas) {
    event.preventDefault();
    if (event.repeat) return;
    if (game.status === "running") pauseGame();
    else start();
  } else if (event.key === "Escape") {
    pauseGame();
  }
});
canvas.addEventListener("pointerdown", (event) => {
  if (game.status !== "running" || event.button !== 0) return;
  swipe = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!swipe) return;
  const dx = event.clientX - swipe.x,
    dy = event.clientY - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;
  turn(
    game,
    Math.abs(dx) > Math.abs(dy)
      ? dx > 0
        ? "right"
        : "left"
      : dy > 0
        ? "down"
        : "up",
  );
  swipe = null;
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
  canvas.addEventListener(type, () => {
    swipe = null;
  });
}
playground.addEventListener("focusout", (event) => {
  if (!playground.contains(event.relatedTarget)) pauseGame();
});
window.addEventListener("blur", pauseGame);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseGame();
});
new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) pauseGame();
}).observe(canvas);

if (ctx) {
  play.disabled = false;
  play.textContent = "Play Snake →";
  update();
} else {
  $("#overlay-description").textContent =
    "This browser cannot display the game. You can still say hello on LinkedIn.";
  play.textContent = "Game unavailable";
}
