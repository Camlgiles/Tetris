const canvas = document.getElementById("tetris");
const context = canvas.getContext('2d');


context.scale(20, 20);

let highScore = 0;

// const matrix = [
//   [0, 0, 0],
//   [1, 1, 1],
//   [0, 1, 0],
// ];

const colors = [
  null, 
  'red',
  'blue', 
  'violet',
  'green',
  'purple',
  'orange',
  'pink'
]

let rowCount = 0;
let level = 0;
let levelcounter = 0;
function arenaSweep() {
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    
    rowCount += 1;
    levelcounter += 1;
    if (levelcounter >= 5) {
      levelcounter = 0;
      level += 1;
    }
    let playback = (0.05 * level);
    if (rowCount >= 2) {
      player.score = rowCount * 10 * (playback * 100);
    } else {
      player.score = rowCount * 10;
    }
    
    if (player.score > highScore) {
      highScore = player.score;
    }
    // if (rowCount < 30) {
    //   audio.playbackRate = ((1)+(playback));
    // } else {
    //   audio.playbackRate = (1+(0.05 * 6));
    // }
  }
}


function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos)
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      // console.log(player.pos.x, player.pos.y);
      if (m[y][x] !== 0 && 
        (arena[y + o.y] && 
        arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "T") {
    return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
  } else if (type === "O") {
    return [[2, 2], [2, 2]];
  } else if (type === "L") {
    return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
  } else if (type === "J") {
    return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
  } else if (type === "I") {
    return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
  } else if (type === "S") {
    return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  } else if (type === "Z") {
    return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
  }
}


function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,y + offset.y,.9,.9)
      }
    })
  })
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(direction) {
  player.pos.x += direction;
  if (collide(arena, player)) {
    player.pos.x -= direction;
  }
}

function playerRotate(dir) {
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix[0].length);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = ( arena[0].length / 2 | 0) - 
  ( player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    if (player.score > highScore) {
      highScore = player.score;
    }
    rowCount = 0;
    player.score = 0;
    arena.forEach(row => row.fill(0));
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y], matrix[y][x]
      ] = 
      [
        matrix[y][x], matrix[x][y]
      ]
    } 
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}


function updateScore() {
  document.getElementById('score-title').innerText = "Score";
  document.getElementById('score').innerText = Math.floor(player.score);
  document.getElementById("level-title").innerText = "Level";
  document.getElementById("level").innerText = Math.floor(level + 1);
  document.getElementById("row-count-title").innerText = "Rows Completed";
  document.getElementById("row-count").innerText = Math.floor(rowCount);
  document.getElementById("high-score-title").innerText = "High Score";
  document.getElementById("high-score").innerText = Math.floor(highScore);
}

let dropCounter = 0;
let dropInterval = 800;

let lastTime = 0;
function update(time = 0) {
  dropInterval = 800 / (1 + ((rowCount * 0.02) * 2) );
  const deltaTime = time - lastTime;
  lastTime = time;
  
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    // player.pos.y++;
    dropCounter = 0;
    playerDrop();
  }
  
  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}


document.addEventListener('keydown', event => {
  // console.log(event.keyCode);
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  } else if (event.keyCode === 13) {
    var element = document.getElementById("element-id");
    element.parentNode.removeChild(element);
    document.getElementById("scoreboard").style.padding = "18px 15px 7px 15px";
    document.getElementById("tetris").style.border = "solid .2em #ffffff";
    document.getElementById("scoreboard").style.border = "6px solid white";
     audio.play()
     updateScore();
     playerReset();
     update();
    }
  });

  var audio = document.getElementById("my_audio");

