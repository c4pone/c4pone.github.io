document.querySelector("#year").textContent = new Date().getFullYear();
console.info(
  "Hey, I’m Flo 👋 Curious about the code or want to chat? Reach out: https://www.linkedin.com/in/florian-kirchner/",
);

const play = document.querySelector("#play");
play.disabled = false;
play.textContent = "Play Snake →";
play.addEventListener("click", loadGame);

async function loadGame() {
  play.disabled = true;
  play.textContent = "Loading…";
  try {
    const game = await import("./game.js");
    play.removeEventListener("click", loadGame);
    game.start();
  } catch {
    play.disabled = false;
    play.textContent = "Try again →";
    document.querySelector("#game-message").textContent =
      "Couldn’t load Snake. Check your connection and try again.";
  }
}
