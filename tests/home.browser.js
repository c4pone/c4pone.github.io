// Run on a freshly loaded homepage via the browser console or `orca eval`.
(async () => {
  let checks = 0;
  const assert = (condition, label) => {
    if (!condition) throw new Error(label);
    checks++;
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#snake");
  $(".playground").scrollIntoView({ block: "center" });
  await wait(100);
  assert(!$("#play").disabled, "Game initializes");
  assert(
    performance
      .getEntriesByType("resource")
      .every(
        (entry) =>
          !/\/(game\.js|snake\.mjs)$/.test(new URL(entry.name).pathname),
      ),
    "Game code is not downloaded before Play",
  );
  assert(
    performance
      .getEntriesByType("resource")
      .every((entry) => new URL(entry.name).origin === location.origin),
    "Initial page makes no third-party requests",
  );
  assert(!$("#game-overlay").hidden, "Game waits for an explicit start");
  $("#play").click();
  for (let i = 0; i < 100 && !$("#game-overlay").hidden; i++) await wait(30);
  assert(
    $("#game-overlay").hidden && document.activeElement === canvas,
    "Play starts and focuses the board",
  );
  $("#pause").click();
  const before = canvas.toDataURL();
  await wait(250);
  assert(
    canvas.toDataURL() === before && !$("#game-overlay").hidden,
    "Pause freezes the board",
  );
  $("#play").click();
  for (let i = 0; i < 30 && $("#score").textContent === "000"; i++)
    await wait(60);
  assert(
    $("#score").textContent === "010",
    "Eating the first apple increases score",
  );
  $("#pause").click();
  assert(
    $("#overlay-title").textContent.includes("breather"),
    "Paused overlay appears",
  );
  $("#play").click();
  const key = new KeyboardEvent("keydown", {
    key: "ArrowDown",
    bubbles: true,
    cancelable: true,
  });
  canvas.dispatchEvent(key);
  assert(
    key.defaultPrevented,
    "Arrow keys steer without scrolling while playing",
  );
  await wait(210);
  $('[data-direction="left"]').click();
  await wait(210);
  $("#pause").click();
  assert(
    Number($("#score").textContent) >= 10 && !$("#game-overlay").hidden,
    "Keyboard and touch controls can turn safely",
  );
  $("#play").click();
  for (let i = 0; i < 60 && $("#game-overlay").hidden; i++) await wait(60);
  assert(
    $("#play").textContent.includes("again"),
    "Wall collision offers replay",
  );
  assert(document.activeElement === $("#play"), "Game over focuses replay");
  $("#play").click();
  assert($("#score").textContent === "000", "Replay resets the score");
  document.querySelector(".hello-link").focus();
  assert(
    !$("#game-overlay").hidden && $("#pause").textContent.includes("Resume"),
    "Leaving the game pauses it",
  );
  const bounds = canvas.getBoundingClientRect();
  assert(Math.abs(bounds.width - bounds.height) < 2, "Board stays square");
  assert(
    document.documentElement.scrollWidth <= innerWidth,
    "No horizontal overflow",
  );
  assert(
    [...document.querySelectorAll("[data-direction]")].every(
      (button) => button.getBoundingClientRect().width >= 44,
    ),
    "Direction buttons have touch-sized targets",
  );
  assert(
    [...document.querySelectorAll('a[href*="linkedin.com"]')].every(
      (link) => link.href === "https://www.linkedin.com/in/florian-kirchner/",
    ),
    "LinkedIn links are unchanged",
  );
  return { passed: checks, width: innerWidth };
})();
