document.addEventListener('DOMContentLoaded', () => {
    let level = 1;
    let timer = 0;
    let score = 0;
    let timerInterval;
    let difficulty = null;

    const levelElement = document.getElementById('level');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const difficultyButtons = document.querySelectorAll('#difficulty-selection button');

    // Expose these variables globally
    window.board = [];
    window.revealed = [];

    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.id;
            lockDifficultySelection();
            initializeGame();
        });
    });

    function lockDifficultySelection() {
        difficultyButtons.forEach(button => {
            button.disabled = true;
        });
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = `Time: ${timer}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateScore() {
        score++;
        scoreElement.textContent = `Score: ${score}`;
    }

    function initializeGame() {
        stopTimer();
        timer = 0;
        score = 0;
        timerElement.textContent = `Time: ${timer}s`;
        scoreElement.textContent = `Score: ${score}`;

        const { size, numMines } = getLevelConfig(level, difficulty);
        
        // Initialize board and revealed globally
        window.board = createBoard(size);
        window.revealed = Array.from({ length: size }, () => Array(size).fill(false));

        placeMines(window.board, numMines);
        calculateNumbers(window.board);
        createGameBoard(window.board, window.revealed);

        startTimer();
    }

    function getLevelConfig(level, difficulty) {
        const baseSize = {
            easy: 8,
            medium: 12,
            hard: 16
        }[difficulty];

        const baseMines = {
            easy: 10,
            medium: 20,
            hard: 30
        }[difficulty];

        return {
            size: baseSize + level * 2,
            numMines: baseMines + level * 5
        };
    }

    function revealCell(board, revealed, row, col) {
        if (revealed[row][col]) return;
        revealed[row][col] = true;
        updateScore();

        if (board[row][col] === '0') {
            revealAdjacentCells(board, revealed, row, col);
        }
    }

    function revealAdjacentCells(board, revealed, row, col) {
        const stack = [[row, col]];
        while (stack.length) {
            const [r, c] = stack.pop();
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < board.length && nc >= 0 && nc < board.length && !revealed[nr][nc]) {
                        revealed[nr][nc] = true;
                        updateScore();
                        if (board[nr][nc] === '0') {
                            stack.push([nr, nc]);
                        }
                    }
                }
            }
        }
    }

    function checkGameOver(board, revealed) {
        const size = board.length;
        const allRevealed = revealed.flat().every((cell, idx) => {
            const row = Math.floor(idx / size);
            const col = idx % size;
            return cell || board[row][col] === 'M';
        });
        
        if (allRevealed) {
            stopTimer();
            setTimeout(() => {
                alert(`Congratulations! You've cleared all safe spots in ${timer} seconds with a score of ${score}. Moving to level ${level + 1}.`);
                level++;
                levelElement.textContent = `Level: ${level}`;
                initializeGame();
            }, 100);
        }

        const hitMine = revealed.flat().some((cell, idx) => {
            const row = Math.floor(idx / size);
            const col = idx % size;
            return cell && board[row][col] === 'M';
        });

        if (hitMine) {
            stopTimer();
            setTimeout(() => alert(`Game Over! You hit a mine. Time: ${timer} seconds. Score: ${score}.`), 100);
        }
    }

    function createGameBoard(board, revealed) {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';  // Clear previous board
        gameBoard.style.gridTemplateColumns = `repeat(${board.length}, 40px)`;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.addEventListener('click', () => {
                    revealCell(board, revealed, row, col);
                    updateBoard(board, revealed);
                    checkGameOver(board, revealed);
                });
                gameBoard.appendChild(cell);
            }
        }
    }

    function createBoard(size) {
        return Array.from({ length: size }, () => Array(size).fill(' '));
    }

    function placeMines(board, numMines) {
        const size = board.length;
        let mines = 0;
        while (mines < numMines) {
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            if (board[row][col] !== 'M') {
                board[row][col] = 'M';
                mines++;
            }
        }
    }

    function calculateNumbers(board) {
        const size = board.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (board[row][col] === 'M') continue;
                let mineCount = 0;
                for (let r = Math.max(0, row - 1); r <= Math.min(size - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(size - 1, col + 1); c++) {
                        if (board[r][c] === 'M') mineCount++;
                    }
                }
                board[row][col] = mineCount.toString();
            }
        }
    }

    function updateBoard(board, revealed) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            const row = Math.floor(idx / board.length);
            const col = idx % board.length;
            if (revealed[row][col]) {
                cell.classList.add('revealed');
                cell.textContent = board[row][col] === '0' ? '' : board[row][col];
                if (board[row][col] === 'M') cell.classList.add('mine');
            }
        });
    }
});
