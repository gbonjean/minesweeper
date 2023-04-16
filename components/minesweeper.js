import { useState } from 'react';

const STATES = [
  "unopened",
  "mine-neighbour-1",
  "mine-neighbour-2",
  "mine-neighbour-3",
  "mine-neighbour-4",
  "mine-neighbour-5",
  "mine-neighbour-6",
  "mine-neighbour-7",
  "mine-neighbour-8",
  "mine"
]




const createBoard = (rows, cols, minesDensity) => {
  const board = Array.from(Array(rows), () => new Array(cols).fill(0))

  // Placing Mines
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (Math.random() < minesDensity) board[i][j] = 9;
    }
  }

  // Filling board
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j] < 9) {
        let count = 0;
        for (let r = i - 1; r <= i + 1; r++) {
          for (let c = j - 1; c <= j + 1; c++) {
            if (r === i && c === j) continue;
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === 9) count++;
          }
        }
        board[i][j] = count;
      }
    }
  }

  return board;
}

export default function Minesweeper() {
  const rows = 8;
  const cols = 8;
  const minesDensity = 0.2;

  const board = createBoard(rows, cols, minesDensity);

  console.log(board);


  return (
    <h1>Hello</h1>
  );
}

function Grid({ rows, cols, mines }) {
  const [grid, setGrid] = useState(Array.from(Array(rows), () => new Array(cols).fill(0)))

  const lookAround = (row, col) => {
    let count = 0;
    const toCheck = [];

    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col -1; j <= col + 1; j++) {
        if (i >= 0 && i < rows && j >= 0 && j < cols && grid[i][j] === 0) {
          if (mines.includes(`${i}-${j}`)) count++;
          else toCheck.push([i, j])
        }
      }
    }

    if (count === 0) {
      const nextGrid = grid.slice();
      nextGrid[row][col] = 1;
      setGrid(nextGrid);
      toCheck.forEach((e) => {
        lookAround(e[0], e[1])
      });
    } else {
      const nextGrid = grid.slice();
      nextGrid[row][col] = count + 3;
      setGrid(nextGrid);
    }
  }

  // const lookAround = (i) => {
  //   const x = Math.floor(i / cols);
  //   const y = i % cols;
  //   let count = 0;
  //   const toCheck = [];

  //   if (count === 0) {
  //     cells[i].classList.replace('unopened', 'opened');
  //     toCheck.forEach((j) => {
  //       lookAround(j);
  //     });
  //   } else cells[i].classList.replace('unopened', `mine-neighbour-${count}`);
  // };

  function rightClick(i, j) {
    if (grid[i][j] === 0) {
      const nextGrid = grid.slice();
      nextGrid[i][j] = 2;
      setGrid(nextGrid);
    }
  }

  function leftClick(i, j) {
    if (grid[i][j] === 0) {
      if (mines.includes(`${i}-${j}`)) {
        const nextGrid = grid.slice();
        nextGrid[i][j] = 3;
        setGrid(nextGrid);
        console.log("BOOM");
      } else lookAround(i, j);
    }
  }

  function handleClick(e, i, j) {
    if (e.buttons === 3) {
      console.log("both");
    } else if (e.buttons === 1) {
      leftClick(i, j);
    } else rightClick(i,j);

  }

  // Creating board
  let board = [];
  let key = 0;
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(<Cell key={key} value={grid[i][j]} onCellClick={(e) => handleClick(e,i,j)}/>)
      key++;
    }
    board.push(<tr key={key}>{row}</tr>)
  }

  return (
    <table><tbody id="minesweeper">{board}</tbody></table>
  );
}

function Cell({ value, onCellClick }) {
  return (
    <td className={STATES[value]} onMouseDown={onCellClick} onContextMenu={(e) => e.preventDefault()}></td>
  );
}

function Info() {

}
