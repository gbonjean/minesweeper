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
  "mine",
  "flagged"
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
  const minesDensity = 0.1;

  const board = createBoard(rows, cols, minesDensity);

  return (
    <Grid grid={board}/>
  );
}

function Grid({ grid }) {
  const [mask, setMask] = useState(Array.from(Array(grid.length), () => new Array(grid[0].length).fill(true)))

  const changeMask = (i, j) => {
    const nextMask = mask.slice()
    nextMask[i][j] = false
    setMask(nextMask)
  }


  const rightClick = (i, j) => {
    if (mask[i][j]) changeMask(i, j)
  }

  const handleClick = (e, i, j) => {
    if (e.buttons === 3) {
      console.log("both");
    } else if (e.buttons === 1) {
      leftClick(i, j);
    } else rightClick(i, j);
  }

  // Render board
  let board = [];
  let key = 0;
  for (let i = 0; i < mask.length; i++) {
    let row = [];
    for (let j = 0; j < mask[0].length; j++) {
      row.push(<Cell key={key} value={mask[i, j] ? 0 : grid[i, j]} onCellClick={(e) => handleClick(e,i,j)} />)
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
