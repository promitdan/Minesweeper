function startGame(difficulty) {
  if (!grid.isGameOver()) {
    return;
  }
  grid.removeGrid(targetElement);
  document.querySelectorAll('.gameControls')[0].style.display = 'none';
  document.querySelectorAll('.resetBtn')[0].style.display = 'flex';
  grid.generateGrid(10, targetElement);
  grid.setGameDifficulty(difficulty);
  grid.placeBombs();
}

function resetGame() {
  grid.resetGame();
}
const createDOMElement = (type, config) => {
  const elem = document.createElement(type);
  const { dataValue } = config;
  Object.keys(config).forEach(key => {
    if (key !== 'dataValue') {
      elem[key] = config[key];
    } else {
      elem.setAttribute('data-key', dataValue);
    }
  });
  return elem;
}
function handleGridClick(e) {
  const element = event.target;
  if (grid.isGameOver()) {
    return;
  }
  const key = element.getAttribute('data-key');
  if (!key || key.split('-').length < 2) {
    return;
  }
  grid.processCell(key);
}
class Grid {
  constructor(size) {
    this.size = size;
    this.gridData = {};
    this.gameOver = true;
    this.bombCount = 20;
  }

  resetGame() {
    this.clearGrid();
    this.placeBombs();
    this.gameOver = false;
  }

  removeGrid(elem) {
    elem.innerHTML = "";
    this.gridData = {};
  }

  clearGrid() {
    document.querySelectorAll('.gridCell').forEach(cell => {
      cell.innerHTML = "";
      cell.classList.remove('discoveredCell');
      this.gridData = {};
    })
  }

  placeBombs() {
    while(Object.keys(this.gridData).length < this.bombCount) {
      const randomX = Math.floor(Math.random() * 10);
      const randomY = Math.floor(Math.random() * 10);
      if (!this.gridData[`${randomX}-${randomY}`]) {
        this.gridData[`${randomX}-${randomY}`] = 'BOMB';
      }
    }
  }
  getGridData() {
    return this.gridData;
  }
  generateGrid(size, targetElement) {
    this.gameOver = false;
    for (let i = 0; i < size; i++) {
      const row = createDOMElement('div', {
        className: 'gridRow',
        dataValue: `${i}`
      });
      for (let j = 0; j < size; j++) {
        const cell = createDOMElement('div', {
          className: 'gridCell',
          dataValue: `${i}-${j}`
        });
        if (i === 0) {
          cell.classList.add('topCell');
        }
        if (i === (this.size - 1)) {
          cell.classList.add('bottomCell');
        }
        if (j === 0) {
          cell.classList.add('leftCell');
        }
        if (j === (this.size - 1)) {
          cell.classList.add('rightCell');
        }
        row.appendChild(cell);
      }
      targetElement.appendChild(row);
    }
  }
  processCell(key) {
    if (this.gridData[key] === 'BOMB') {
      this.gameOver = true;
      this.setGameOverMsg(false);
      this.revealBombs();
    } else {
      this.checkNeighbours(key);
    }
  }
  setGameOverMsg(isWin) {
    const element = document.getElementById('gameMsg');
    if (isWin) {
      element.classList.add('successMsg');
      element.innerHTML = "Congrats! You won!"
    } else {
      element.classList.add('errorMsg');
      element.innerHTML = "You Lose! Game Over!"
    }
  }
  isGameOver () {
    return this.gameOver;
  }
  revealBombs() {
    Object.keys(this.gridData).forEach(key => {
      if (this.gridData[key] ==='BOMB' ) {
        const element = document.querySelector(`[data-key="${key}"]`);
        // element.innerHTML = 'X';
        const image = createDOMElement('img', {
          src: './assets/images/mine.png',
          className: 'mineImg'
        });
        element.appendChild(image);
      }
    })
  }
  checkNeighbours(key) {
    console.log('Current box: ', key);
    let [row, col] = [key.split('-')[0], key.split('-')[1]];
    row = parseInt(row, 10);
    col = parseInt(col, 10);
    // Surrounding squares
    const top = `${row-1}-${col}`;
    const topRight = `${row-1}-${col + 1}`;
    const right = `${row}-${col + 1}`;
    const bottomRight = `${row + 1}-${col + 1}`;
    const bottom = `${row + 1}-${col}`;
    const bottomLeft = `${row + 1}-${col - 1}`;
    const left = `${row}-${col - 1}`;
    const topLeft = `${row - 1}-${col - 1}`;


    const topValue = this.gridData[top] === 'BOMB' ? 1: 0;
    const topRightValue = this.gridData[topRight] === 'BOMB' ? 1: 0;
    const rightValue = this.gridData[right] === 'BOMB' ? 1: 0;
    const bottomRightValue = this.gridData[bottomRight] === 'BOMB' ? 1: 0;
    const bottomValue = this.gridData[bottom] === 'BOMB' ? 1: 0;
    const bottomLeftValue = this.gridData[bottomLeft] === 'BOMB' ? 1: 0;
    const leftValue = this.gridData[left] === 'BOMB' ? 1: 0;
    const topLeftValue = this.gridData[topLeft]=== 'BOMB' ? 1: 0;
    const surroundingBombs = parseInt(topValue) + parseInt(topRightValue) + parseInt(rightValue) + parseInt(bottomRightValue) +
    parseInt(bottomValue) + parseInt(bottomLeftValue) + parseInt(leftValue) + parseInt(topLeftValue);
    this.gridData[key] = surroundingBombs;

    const element = document.querySelector(`[data-key="${key}"]`);
    element.innerHTML = surroundingBombs;
    element.classList.add('discoveredCell');
  }
}

const grid = new Grid(10);
const targetElement = document.getElementById('gridRoot');
targetElement.addEventListener('click', handleGridClick);
grid.generateGrid(10, targetElement);
grid.placeBombs();