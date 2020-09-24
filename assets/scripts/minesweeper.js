(function () {
  /**
   * name: startGame
   * desc: initializes the grid and places bombs
   * @param {String} difficulty: place bombs as per difficulty selected by user
   */
  function startGame(difficulty) {
    if (!grid.isGameOver()) {
      return;
    }
    grid.removeGrid(targetElement);
    document.querySelectorAll('.gameControls')[0].style.display = 'none';
    document.querySelectorAll('.resetBtn')[0].style.display = 'flex';
    document.querySelectorAll('.gameMsg')[0].style.display = 'none';
    grid.generateGrid(10, targetElement);
    grid.setGameDifficulty(difficulty);
    grid.setPlayerLife(3);
    grid.placeBombs();
  }
  /**
   * name: resetGame
   * desc: Resets the grid
   */
  function resetGame() {
    grid.resetGame();
    grid.setPlayerLife(3)
  }
  /**
   * name: createDOMElement
   * desc: creates a DOM element as per user input and returns it
   * @param {String} type: HTML tag name 
   * @param {Object} config: Object containing attribute key-value pairs to be applied to the DOM
   */
  const createDOMElement = (type, config) => {
    const elem = document.createElement(type);
    const { className, dataValue, src } = config;
    Object.keys(config).forEach(key => {
      if (key !== 'dataValue') {
        elem[key] = config[key];
      } else {
        elem.setAttribute('data-key', dataValue);
      }
    });
    return elem;
  }
  /**
   * name: handleGridClick
   * desc: Captures clicks made on the grid
   * @param {Object} e: event
   */
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
  /**
   * Grid class contains all the properties of the grid and methods to change those properties
   * Keeps a track of the size, the data inside the grid and the bombCount
   */
  class Grid {
    constructor(size) {
      this.size = size;
    }
    #gridData = {};
    #gameOver = true;
    #bombCount = 10;
    #playerLife = 1;

    setPlayerLife(value) {
      this.#playerLife = value;
      const lifeBar = document.querySelectorAll('.lifeBar')[0];
      lifeBar.innerHTML = "";
      console.log('HERE');
      for (let i = 0; i < this.#playerLife; i++) {
        const life = createDOMElement('img', {
          src: './assets/images/life.png',
          className: 'lifeImg'
        });
        lifeBar.appendChild(life);
      }
    }

    decrementLife() {
      this.#playerLife--;
      const lifeBar = document.querySelectorAll('.lifeBar')[0];
      lifeBar.innerHTML = "";
      for (let i = 0; i < this.#playerLife; i++) {
        const life = createDOMElement('img', {
          src: './assets/images/life.png',
          className: 'lifeImg'
        });
        lifeBar.appendChild(life);
      }
    }
    // Clears the grid data and removes the numbers input so far. Also places bombs randomly
    resetGame() {
      this.clearGrid();
      this.placeBombs();
      this.#gameOver = false;
    }
    // Removes the GridCells from the DOM
    removeGrid(elem) {
      elem.innerHTML = "";
      this.#gridData = {};
    }
    // Removes additional classes that might have been applied to grid cells
    clearGrid() {
      document.querySelectorAll('.gridCell').forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('discoveredCell');
        this.#gridData = {};
      })
    }
    // Places bombs on the grid randomly based on the bombCount variable
    placeBombs() {
      while (Object.keys(this.#gridData).length < this.#bombCount) {
        const randomX = Math.floor(Math.random() * 10);
        const randomY = Math.floor(Math.random() * 10);
        if (!this.#gridData[`${randomX}-${randomY}`]) {
          this.#gridData[`${randomX}-${randomY}`] = 'BOMB';
        }
      }
    }
    // Returns the grid data
    getGridData() {
      return this.#gridData;
    }
    // Creates the grid cells on the DOM
    generateGrid(size, targetElement) {
      this.#gameOver = false;
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
    // Handles the logic when a cell is clicked
    // If the cell is a bomb: GAME OVER
    // If the cell is clear, calculate the number of bombs in the adjoining cells and print the value on the cell
    // If the cell is clear and has no adjoining neighbours with bombs, reveal the surrounding cells that have neighbours with bombs
    processCell(key) {
      if (this.#gridData[key] === 'BOMB') {
        this.decrementLife();
        if (this.#playerLife === 0) {
          this.#gameOver = true;
          this.setGameOverMsg(false);
          this.revealBombs();
        } else {
          const element = document.querySelector(`[data-key="${key}"]`);
          const image = createDOMElement('img', {
            src: './assets/images/mine.png',
            className: 'mineImg'
          });
          element.innerHTML = "";
          element.appendChild(image);
        }
      } else {
        this.checkNeighbours(key);
      }
    }
    // Used to reveal bombs on the grid
    revealBombs() {
      Object.keys(this.#gridData).forEach(key => {
        if (this.#gridData[key] === 'BOMB') {
          const element = document.querySelector(`[data-key="${key}"]`);
          // element.innerHTML = 'X';
          const image = createDOMElement('img', {
            src: './assets/images/mine.png',
            className: 'mineImg'
          });
          element.innerHTML = "";
          element.appendChild(image);
        }
      })
    }
    // If the cell does not contain a bomb, this function is used to calculate the bombs in adjoining cells
    checkNeighbours(key) {
      let [row, col] = [key.split('-')[0], key.split('-')[1]];
      row = parseInt(row, 10);
      col = parseInt(col, 10);
      // Surrounding squares
      const top = `${row - 1}-${col}`;
      const topRight = `${row - 1}-${col + 1}`;
      const right = `${row}-${col + 1}`;
      const bottomRight = `${row + 1}-${col + 1}`;
      const bottom = `${row + 1}-${col}`;
      const bottomLeft = `${row + 1}-${col - 1}`;
      const left = `${row}-${col - 1}`;
      const topLeft = `${row - 1}-${col - 1}`;


      const topValue = this.#gridData[top] === 'BOMB' ? 1 : 0;
      const topRightValue = this.#gridData[topRight] === 'BOMB' ? 1 : 0;
      const rightValue = this.#gridData[right] === 'BOMB' ? 1 : 0;
      const bottomRightValue = this.#gridData[bottomRight] === 'BOMB' ? 1 : 0;
      const bottomValue = this.#gridData[bottom] === 'BOMB' ? 1 : 0;
      const bottomLeftValue = this.#gridData[bottomLeft] === 'BOMB' ? 1 : 0;
      const leftValue = this.#gridData[left] === 'BOMB' ? 1 : 0;
      const topLeftValue = this.#gridData[topLeft] === 'BOMB' ? 1 : 0;
      const surroundingBombs = parseInt(topValue) + parseInt(topRightValue) + parseInt(rightValue) + parseInt(bottomRightValue) +
        parseInt(bottomValue) + parseInt(bottomLeftValue) + parseInt(leftValue) + parseInt(topLeftValue);
      this.#gridData[key] = surroundingBombs;

      const element = document.querySelector(`[data-key="${key}"]`);
      element.innerHTML = surroundingBombs;
      element.classList.add('discoveredCell');
      if (surroundingBombs === 0) {
        if (row > 0 && this.#gridData[top] === undefined) {
          this.checkNeighbours(top);
        }
        if (row > 0 && col < this.size - 1 && this.#gridData[topRight] === undefined) {
          this.checkNeighbours(topRight);
        }
        if (col < this.size - 1 && this.#gridData[right] === undefined) {
          this.checkNeighbours(right);
        }
        if (col < this.size - 1 && row < this.size - 1 && this.#gridData[bottomRight] === undefined) {
          this.checkNeighbours(bottomRight);
        }
        if (row < this.size - 1 && this.#gridData[bottom] === undefined) {
          this.checkNeighbours(bottom);
        }
        if (row < this.size - 1 && col > 0 && this.#gridData[bottomLeft] === undefined) {
          this.checkNeighbours(bottomLeft);
        }
        if (col > 0 && this.#gridData[left] === undefined) {
          this.checkNeighbours(left);
        }
        if (row > 0 && col > 0 && this.#gridData[topLeft] === undefined) {
          this.checkNeighbours(topLeft);
        }
      }
      if (this.isWinningMove()) {
        this.#gameOver = true;
        this.setGameOverMsg(true);
      }
    }
    // Function for setting game difficulty
    // EASY: 10% of grid is bombs
    // MEDIUM: 15% of the grid is bombs
    // HARD: 20% of the grid is bombs
    // INSANE: 50% of the grid is bombs
    setGameDifficulty(input) {
      let factor = 10;
      if (input === 'EASY') {
        factor = 10;
      } else if (input === 'MEDIUM') {
        factor = 7;
      } else if (input === 'HARD') {
        factor = 5
      } else if (input === 'INSANE') {
        factor = 2;
      }

      this.#bombCount = Math.ceil(Math.pow(this.size, 2) / factor);
    }
    // Sets appropriate message when game is over
    setGameOverMsg(isWin) {
      document.querySelectorAll('.resetBtn')[0].style.display = 'none';
      document.querySelectorAll('.gameControls')[0].style.display = 'block';
      const element = document.getElementById('gameMsg');
      if (isWin) {
        element.classList.add('successMsg');
        element.innerHTML = "Congrats! You won!";
        element.style.display = 'block';
      } else {
        element.classList.add('errorMsg');
        element.innerHTML = "You Lose! Game Over!";
        element.style.display = 'block';
      }
    }
    // Returns if game is over or not
    isGameOver() {
      return this.#gameOver;
    }
    // Checks if the last action meets the winning requirements
    isWinningMove() {
      const targetCount = (this.size * this.size) - this.#bombCount;
      let currentCount = 0;
      Object.keys(this.#gridData).forEach(key => {
        if (this.#gridData[key] !== 'BOMB' && this.#gridData[key] !== undefined) {
          currentCount++;
        }
      });
      return !(currentCount < targetCount);
    }
  }

  // Code for initializing the game
  const grid = new Grid(10);
  const targetElement = document.getElementById('gridRoot');
  targetElement.addEventListener('click', handleGridClick);
  const gameMenuContainer = document.querySelectorAll('.difficulty')[0];
  ['EASY', 'MEDIUM', 'HARD', 'INSANE'].forEach( difficulty => {
    const difficultyBtn = createDOMElement('div', {
      className: `difficultyBtn ${difficulty.toLowerCase()}`
    });
    difficultyBtn.innerHTML = difficulty;
    difficultyBtn.addEventListener('click', startGame.bind(null, difficulty));
    gameMenuContainer.appendChild(difficultyBtn);
  });
  const resetElementWrapper = document.querySelectorAll('.statsWrapper')[0];
  const resetBtn = createDOMElement('div', {
    className: 'resetBtn'
  });
  resetBtn.innerHTML = 'Reset Game';
  resetBtn.addEventListener('click', resetGame);
  resetBtn.style.display = 'none';
  resetElementWrapper.appendChild(resetBtn);
})()
