document.addEventListener('DOMContentLoaded', () => {
    const cheatButton = document.getElementById('cheat-button');
    const cheatOptions = document.getElementById('cheat-options');

    cheatButton.addEventListener('click', () => {
        const selectedCheat = cheatOptions.value;
        useCheat(selectedCheat);
    });

    function useCheat(cheat) {
        const board = window.board;  // Access the global board variable
        const revealed = window.revealed;  // Access the global revealed variable

        switch (cheat) {
            case 'reveal-board':
                revealEntireBoard(board, revealed);
                break;
            case 'reveal-mines':
                revealAllMines(board, revealed);
                break;
            case 'hint':
                giveHint(board, revealed);
                break;
            default:
                console.error('Invalid cheat option.');
        }
    }

    function revealEntireBoard(board, revealed) {
        // Implementation to reveal entire board
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                revealed[row][col] = true;
            }
        }
        updateBoard(board, revealed);
    }

    function revealAllMines(board, revealed) {
        // Implementation to reveal all mines
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                if (board[row][col] === 'M') {
                    revealed[row][col] = true;
                }
            }
        }
        updateBoard(board, revealed);
    }

    function giveHint(board, revealed) {
        // Implementation to give hint
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                if (!revealed[row][col] && board[row][col] !== 'M') {
                    revealed[row][col] = true;
                    updateBoard(board, revealed);
                    return;
                }
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
