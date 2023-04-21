import React, { useState, useEffect } from 'react';
import Image from 'next/image'

export default function Minesweeper() {
  const minesDensity = 0.3

  const [maxHeight, setMaxHeight] = useState(4)
  const [maxWidth, setMaxWidth] = useState(4)
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(4)
  const [grid, setGrid] = useState(createBoard(rows, cols, minesDensity))
  const [mask, setMask] = useState(fillMask(rows, cols, 12))
  const [bgColor, setBgColor] = useState('bg-blue-100')
  const [play, setPlay] = useState(false)

  useEffect(() => {
    setMaxHeight(Math.floor(window.innerHeight / 24 - 5))
    setMaxWidth(Math.floor(window.innerWidth / 24 - 1))
  }, [])

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
      if (grid[i][j] === 9) end(true)
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
    if (hasWon()) end(false)
  }

  const handleRowsChange = (val) => {
    if (val >= 4 && val <= maxHeight) {
      setRows(val)
      setMask(fillMask(val, cols, 12))
    }
  }

  const handleColsChange = (val) => {
    if (val >= 4 && val <= maxWidth) {
      setCols(val)
      setMask(fillMask(rows, val, 12))
    }
  }

  const start = () => {
    setPlay(true)
    setBgColor('bg-blue-50')
    setGrid(createBoard(rows, cols, minesDensity))
    setMask(fillMask(rows, cols, 10))
  }

  const end = (boom) => {
    setPlay(false)
    if (boom) {
      setMask(grid)
      setBgColor('bg-red-100')
    } else setBgColor('bg-green-100')
  }

  return(
    <div onContextMenu={(e) => e.preventDefault()}>
      <Info
        play={play} bgColor={bgColor}
        rows={rows} cols={cols}
        maxHeight={maxHeight} maxWidth={maxWidth}
        onRowsChange={(e) => handleRowsChange(Number(e.target.value))}
        onColsChange={(e) => handleColsChange(Number(e.target.value))}
        onPlay={() => start()}
      />
      <Grid
        play={play}
        grid={grid} mask={mask}
        rows={rows} cols={cols}
        onCellClick={(e, i, j) => handleClick(e, i, j)} />
      <Help />
    </div>
    )
}

const Grid = ({ play, grid, mask, rows, cols, onCellClick }) => {
  const handleClick = (e, i, j) => {
    if (play) {
      onCellClick(e, i, j)
    }
  }

  let board = [];
  let key = 0;
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(<Cell play={play} key={key} value={mask[i][j] > 9 ? mask[i][j] : grid[i][j]} onCellClick={(e) => handleClick(e, i, j)} />)
      key++;
    }
    board.push(<tr key={key}>{row}</tr>)
  }

  return (
    <table className='ml-auto mr-auto'>
      <tbody id="minesweeper">{board}</tbody>
    </table>
  );
}

const Cell = ({ value, onCellClick }) => {
  return (
    <td className={STATES[value]} onMouseDown={onCellClick} onContextMenu={(e) => e.preventDefault()}></td>
  );
}

const Info = ({ play, bgColor, maxHeight, maxWidth, rows, cols, onRowsChange, onColsChange, onPlay }) => {
  console.log(maxHeight);
  return(
    <div className={bgColor}>
      <div className='container-fluid text-center p-2 mb-3'>
        <form onSubmit={(e) => e.preventDefault()} >
            <div className='d-flex justify-content-between align-items-center'>
              <div className='flex-fill'>
                <input
                  type="range" className="form-range" id="rows"
                  value={rows} onChange={play ? null : onRowsChange}
                  min="4" max={maxHeight} disabled={play}>
                </input>
              </div>
              <div className='ms-3 me-3'>
                <input
                  className=""
                  type='image'
                  src={play ? 'img/noplay.png' : 'img/play.png'} height='32px' width='32px'
                  onClick={play ? null : onPlay}
                  />
              </div>
              <div className='flex-fill'>
                <input
                  type="range" className="form-range" id="cols"
                  value={cols} onChange={play ? null : onColsChange}
                  min="4" max={maxWidth} disabled={play}>
                </input>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
}

const Help = () => {
  const [hideHelp, setHideHelp] = useState(true)

  return (
    <div>
      <div className="position-absolute bottom-3 end-10" hidden={hideHelp}>
        <div className='d-flex justify-end align-items-center'>
          <Image src='/../public/img/left-click.jpg' alt="LeftClick" width={18} height={18} />
          <p className='ps-1 pe-3'>Open cell </p>
          <Image src='/../public/img/right-click.jpg' alt="RightClick" width={18} height={18} />
          <p className='ps-1 pe-3'>Place flag </p>
          <Image src='/../public/img/both-click.jpg' alt="bothClick" width={18} height={18} />
          <p className='ps-1 pe-3'>Automatic opening </p>
        </div>
      </div>
      <div className="position-absolute bottom-2 end-2 opacity-75" onClick={() => setHideHelp(!hideHelp)}>
        <Image src='/../public/img/info.png' alt="Help" width={32} height={32} />
      </div>
    </div>
  )
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

const fillMask = (rows, cols, state) => {
  return Array.from(Array(rows), () => new Array(cols).fill(state))
}

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
  "flagged",
  "noplay"
]
