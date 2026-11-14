import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SIZE,
  createGame,
  turn,
  step,
  placeFruit,
} from "../javascripts/snake.mjs";

function running() {
  return { ...createGame(), status: "running" };
}

test("ready and paused games do not move", () => {
  for (const status of ["ready", "paused", "over", "won"]) {
    const game = { ...createGame(), status };
    const before = structuredClone(game);
    turn(game, "up");
    step(game);
    assert.deepEqual(game, before);
  }
});
test("movement keeps length, eating adds one segment and ten points", () => {
  const game = running();
  step(game);
  assert.deepEqual(game.snake[0], { x: 6, y: 8 });
  assert.equal(game.snake.length, 4);
  for (let i = 0; i < 5; i++) step(game, () => 0);
  assert.equal(game.score, 10);
  assert.equal(game.snake.length, 5);
  assert.ok(
    !game.snake.some((p) => p.x === game.fruit.x && p.y === game.fruit.y),
  );
});
test("turns reject reversals and buffer two rapid corners in order", () => {
  const game = running();
  turn(game, "left");
  turn(game, "right");
  assert.deepEqual(game.turns, []);
  turn(game, "up");
  turn(game, "down");
  turn(game, "left");
  turn(game, "down");
  assert.deepEqual(game.turns, ["up", "left"]);
  step(game);
  assert.deepEqual(game.snake[0], { x: 5, y: 7 });
  step(game);
  assert.deepEqual(game.snake[0], { x: 4, y: 7 });
  assert.equal(game.status, "running");
});
test("wall and body collisions end the game without moving the snake", () => {
  const wall = running();
  wall.snake = [
    { x: SIZE - 1, y: 2 },
    { x: SIZE - 2, y: 2 },
  ];
  step(wall);
  assert.equal(wall.status, "over");
  assert.equal(wall.snake[0].x, SIZE - 1);
  const body = running();
  body.snake = [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
  ];
  step(body);
  assert.equal(body.status, "over");
  assert.deepEqual(body.snake[0], { x: 2, y: 2 });
});
test("moving into the vacating tail is legal", () => {
  const game = running();
  game.snake = [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 2 },
  ];
  step(game);
  assert.equal(game.status, "running");
  assert.deepEqual(game.snake[0], { x: 3, y: 2 });
});
test("fruit uses only free cells and filling the board wins", () => {
  const snake = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => ({
    x: (i + 1) % SIZE,
    y: Math.floor((i + 1) / SIZE),
  }));
  assert.deepEqual(
    placeFruit(snake, () => 0.999),
    { x: 0, y: 0 },
  );
  const game = {
    ...running(),
    snake,
    direction: "left",
    fruit: { x: 0, y: 0 },
  };
  step(game);
  assert.equal(game.status, "won");
  assert.equal(game.snake.length, SIZE * SIZE);
  assert.equal(game.fruit, null);
  assert.equal(placeFruit(game.snake), null);
});
test("a new round resets score, turns and length", () => {
  const game = running();
  for (let i = 0; i < 6; i++) step(game);
  turn(game, "up");
  const fresh = createGame();
  assert.equal(fresh.score, 0);
  assert.equal(fresh.snake.length, 4);
  assert.deepEqual(fresh.turns, []);
  assert.equal(fresh.status, "ready");
});
