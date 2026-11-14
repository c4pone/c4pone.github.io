export const SIZE = 18;
export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};
const same = (a, b) => a.x === b.x && a.y === b.y;

export function createGame() {
  return {
    snake: [5, 4, 3, 2].map((x) => ({ x, y: 8 })),
    direction: "right",
    turns: [],
    fruit: { x: 11, y: 8 },
    score: 0,
    status: "ready",
  };
}

export function turn(game, direction) {
  if (
    game.status !== "running" ||
    !DIRECTIONS[direction] ||
    game.turns.length === 2
  )
    return;
  const last = DIRECTIONS[game.turns.at(-1) || game.direction];
  const next = DIRECTIONS[direction];
  // Queue quick corner inputs, but never allow a reversal into the neck.
  if (last.x * next.x + last.y * next.y !== 0) return;
  game.turns.push(direction);
}

export function placeFruit(snake, random = Math.random) {
  const occupied = new Set(snake.map((p) => p.y * SIZE + p.x));
  const free = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (!occupied.has(i)) free.push(i);
  }
  if (!free.length) return null;
  const index = free[Math.floor(random() * free.length)];
  return { x: index % SIZE, y: Math.floor(index / SIZE) };
}

export function step(game, random = Math.random) {
  if (game.status !== "running") return;
  game.direction = game.turns.shift() || game.direction;
  const direction = DIRECTIONS[game.direction];
  const head = {
    x: game.snake[0].x + direction.x,
    y: game.snake[0].y + direction.y,
  };
  const eating = same(head, game.fruit);
  // The current tail vacates its cell on a non-growing move.
  const body = eating ? game.snake : game.snake.slice(0, -1);
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= SIZE ||
    head.y >= SIZE ||
    body.some((p) => same(p, head))
  ) {
    game.status = "over";
    return;
  }
  game.snake.unshift(head);
  if (eating) {
    game.score += 10;
    game.fruit = placeFruit(game.snake, random);
    if (!game.fruit) game.status = "won";
  } else {
    game.snake.pop();
  }
}
