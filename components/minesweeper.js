import { useState } from 'react';

const STATES = [
  "opened",
  "mine-neighbour-1",
  "mine-neighbour-2",
  "mine-neighbour-3",
  "mine-neighbour-4",
  "mine-neighbour-5",
  "mine-neighbour-6",
  "mine-neighbour-7",
  "mine-neighbour-8",
  "mine",
  "unopened",
  "flagged"
]



export default function Minesweeper() {
  const [play, setPlay] = useState(false)
  const [text, setText] = useState('Bienvenue !')
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(4)

  const minesDensity = 0.1;
  const board = createBoard(rows, cols, minesDensity);


  
  const handleRowsChange = (val) => {
    if (val > 3 && val < 25) setRows(val)
  }

  const handleColsChange = (val) => {
    if (val > 3 && val < 25) setCols(val)
  }

  const end = (boom) => {
    setText(boom ? 'Perdu !' : 'Bravo !')
    setPlay(false)
  }

  if (play) {
    return (
    <div className='container mx-auto px-4'>
      <Grid grid={board} rows={rows} cols={cols} endGame={(boom) => end(boom)} />
    </div>
    )
  } else {
    return (
    <div className='container mx-auto px-4' onContextMenu={(e) => e.preventDefault()}>
      <Info
        text={text}
        rows={rows}
        cols={cols}
        onRowsChange={(e) => handleRowsChange(Number(e.target.value))}
        onColsChange={(e) => handleColsChange(Number(e.target.value))}
        onPlay={() => setPlay(true)}
       />
      {/* <Grid grid={board} rows={rows} cols={cols}  /> */}
    </div>
  );
  }
}

function Grid({ grid, rows, cols, endGame }) {
  const [mask, setMask] = useState(Array.from(Array(rows), () => new Array(cols).fill(10)))

  const gameOver = () => {
    setMask(grid)
    endGame(true)
  }

  const hasWon = () => {
    let res = true
    mask.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 10) res = false
      })
    })
    return res
  }

  const changeMask = (i, j, v) => {
    const nextMask = mask.slice()
    nextMask[i][j] = v
    setMask(nextMask)
  }

  const lookAround = (i, j) => {
    changeMask(i, j, 0)
    const toCheck = []
    for (let r = i - 1; r <= i + 1; r++) {
      for (let c = j - 1; c <= j + 1; c++) {
        if ((r === i && c === j) || r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (mask[r][c] === 10) {
          if (grid[r][c] === 0) toCheck.push([r, c])
          else if (grid[r][c] < 9) changeMask(r, c, 0)
        }
      }
    }
    toCheck.forEach((e) => {
      lookAround(e[0], e[1])
    })
  }

  const leftClick = (i, j) => {
    if (mask[i][j] === 10) {
      if (grid[i][j] === 9) gameOver()
      else lookAround(i, j)
    }
  }

  const rightClick = (i, j) => {
    if (mask[i][j] === 10) changeMask(i, j, 11)
    else if (mask[i][j] === 11) changeMask(i, j, 10)
  }

  const bothClick = (i, j) => {
    let count = 0
    const toOpen = []
    for (let r = i - 1; r <= i + 1; r++) {
      for (let c = j - 1; c <= j + 1; c++) {
        if ((r === i && c === j) || r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (mask[r][c] === 11) count++
        else if (mask[r][c] === 10) toOpen.push([r, c])
      }
    }
    if (grid[i][j] === count) {
      toOpen.forEach((e) => {
        leftClick(e[0], e[1])
      })
    }
  }

  const handleClick = (e, i, j) => {
    if (e.buttons === 1) {
      leftClick(i, j);
    } else if (e.buttons === 2) {
      rightClick(i, j);
    } else bothClick(i, j);
    if (hasWon()) endGame(false)
  }

  let board = [];
  let key = 0;
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(<Cell key={key} value={mask[i][j] > 9 ? mask[i][j] : grid[i][j]} onCellClick={(e) => handleClick(e,i,j)} />)
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

function Info({ text, rows, cols, onRowsChange, onColsChange, onPlay }) {

  return(
    <>
      <p>{text}</p>
      <form onSubmit={(e) => e.preventDefault()} >
        <div className='flex'>
          <label>Nombre de lignes (4 - 24)</label>
          <input type="number" value={rows} onChange={onRowsChange}  />
        </div>
        <div>
          <label>Nombre de colonnes (4 - 24)</label>
          <input type="number" value={cols} onChange={onColsChange}  />
        </div>
        <input type='submit' value="Jouer" onClick={onPlay}/>
      </form>
    </>
  );
}

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
