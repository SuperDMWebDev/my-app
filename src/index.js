import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
const sizeOfBoard = 13;
function Square(props) {
  const className = "square" + (props.highlight ? " highlight" : "");

  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={`${i}-square`}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }
  createABoard() {
    let squares = [];
    let row = [];
    for (let i = 0; i < sizeOfBoard; i++) {
      row = [];
      for (let j = 0; j < sizeOfBoard; j++) {
        row.push(this.renderSquare(i * sizeOfBoard + j));
      }
      squares.push(
        <div className="board-row" key={`${i}-board`}>
          {row}
        </div>
      );
    }
    return squares;
  }
  render() {
    return <div>{this.createABoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(sizeOfBoard * sizeOfBoard).fill(null),
          latestMoveSquare: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    };
  }

  handleClick(i) {
    console.log("handle click i", i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          latestMoveSquare: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }
  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending,
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo.winner;
    const isAscending = this.state.isAscending;

    const moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const col = 1 + (latestMoveSquare % sizeOfBoard);
      const row = 1 + Math.floor(latestMoveSquare / sizeOfBoard);
      const desc = move
        ? "Go to move # ( " + row + "," + col + " )"
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className={move === this.state.stepNumber ? "current-item" : ""}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });
    if (!isAscending) {
      moves.reverse();
    }
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (winnerInfo.isDrawing) {
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winnerInfo.line}
          />
        </div>
        <div className="game-info">
          <div style={{ display: "inline-block", marginRight: "20px" }}>
            {status}
          </div>
          <button onClick={() => this.handleSortToggle()}>
            {isAscending ? "descending" : "ascending"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
function handleWin(row, col, type, winner) {
  let arr = [];
  if (type === "row") {
    arr.push(
      row * sizeOfBoard + col,
      row * sizeOfBoard + col + 1,
      row * sizeOfBoard + col + 2,
      row * sizeOfBoard + col + 3,
      row * sizeOfBoard + col + 4
    );
    return {
      winner: winner,
      line: arr,
      isDrawing: false,
    };
  } else if (type === "col") {
    arr.push(
      col + row * sizeOfBoard,
      col + (row + 1) * sizeOfBoard,
      col + (row + 2) * sizeOfBoard,
      col + (row + 3) * sizeOfBoard,
      col + (row + 4) * sizeOfBoard
    );
    return {
      winner: winner,
      line: arr,
      isDrawing: false,
    };
  } else if (type === "main-diagonal") {
    arr.push(
      col * sizeOfBoard + row,
      (col + 1) * sizeOfBoard + row + 1,
      (col + 2) * sizeOfBoard + row + 2,
      (col + 3) * sizeOfBoard + row + 3,
      (col + 4) * sizeOfBoard + row + 4
    );
    return {
      winner: winner,
      line: arr,
      isDrawing: false,
    };
  } else if (type === "sub-diagonal") {
    arr.push(
      row * sizeOfBoard + col,
      (row + 1) * sizeOfBoard + col - 1,
      (row + 2) * sizeOfBoard + col - 2,
      (row + 3) * sizeOfBoard + col - 3,
      (row + 4) * sizeOfBoard + col - 4
    );
    return {
      winner: winner,
      line: arr,
      isDrawing: false,
    };
  }
  return {
    winner: null,
    line: null,
    isDrawing: false,
  };
}
function calculateWinner(board) {
  // hang ngang
  for (let row = 0; row < sizeOfBoard; row++) {
    for (let col = 0; col < sizeOfBoard - 4; col++) {
      if (
        "XXXXX" ===
        "" +
          board[row * sizeOfBoard + col] +
          board[row * sizeOfBoard + col + 1] +
          board[row * sizeOfBoard + col + 2] +
          board[row * sizeOfBoard + col + 3] +
          board[row * sizeOfBoard + col + 4]
      ) {
        return handleWin(row, col, "row", "X");
      } else if (
        "OOOOO" ===
        "" +
          board[row * sizeOfBoard + col] +
          board[row * sizeOfBoard + col + 1] +
          board[row * sizeOfBoard + col + 2] +
          board[row * sizeOfBoard + col + 3] +
          board[row * sizeOfBoard + col + 4]
      ) {
        return handleWin(row, col, "row", "O");
      }
    }
  }
  // hang doc
  for (let col = 0; col < sizeOfBoard; col++) {
    for (let row = 0; row < sizeOfBoard - 4; row++) {
      if (
        "XXXXX" ===
        "" +
          board[col + row * sizeOfBoard] +
          board[col + (row + 1) * sizeOfBoard] +
          board[col + (row + 2) * sizeOfBoard] +
          board[col + (row + 3) * sizeOfBoard] +
          board[col + (row + 4) * sizeOfBoard]
      ) {
        console.log("compare success");
        return handleWin(row, col, "col", "X");
      } else if (
        "OOOOO" ===
        "" +
          board[col + row * sizeOfBoard] +
          board[col + (row + 1) * sizeOfBoard] +
          board[col + (row + 2) * sizeOfBoard] +
          board[col + (row + 3) * sizeOfBoard] +
          board[col + (row + 4) * sizeOfBoard]
      ) {
        console.log("compare success");
        return handleWin(row, col, "col", "O");
      }
    }
  }
  // hang cheo chinh
  for (let row = 0; row < sizeOfBoard - 4; row++) {
    for (let col = 0; col < sizeOfBoard - 4; col++) {
      if (
        "XXXXX" ===
        "" +
          board[col * sizeOfBoard + row] +
          board[(col + 1) * sizeOfBoard + row + 1] +
          board[(col + 2) * sizeOfBoard + row + 2] +
          board[(col + 3) * sizeOfBoard + row + 3] +
          board[(col + 4) * sizeOfBoard + row + 4]
      ) {
        console.log("compare success");
        return handleWin(row, col, "main-diagonal", "X");
      } else if (
        "OOOOO" ===
        "" +
          board[col * sizeOfBoard + row] +
          board[(col + 1) * sizeOfBoard + row + 1] +
          board[(col + 2) * sizeOfBoard + row + 2] +
          board[(col + 3) * sizeOfBoard + row + 3] +
          board[(col + 4) * sizeOfBoard + row + 4]
      ) {
        console.log("compare success");
        return handleWin(row, col, "main-diagonal", "O");
      }
    }
  }
  // hang cheo phu
  for (let row = 0; row < sizeOfBoard - 4; row++) {
    for (let col = 0; col < sizeOfBoard; col++) {
      if (
        "XXXXX" ===
        "" +
          board[row * sizeOfBoard + col] +
          board[(row + 1) * sizeOfBoard + col - 1] +
          board[(row + 2) * sizeOfBoard + col - 2] +
          board[(row + 3) * sizeOfBoard + col - 3] +
          board[(row + 4) * sizeOfBoard + col - 4]
      ) {
        console.log("compare success");
        return handleWin(row, col, "sub-diagonal", "X");
      } else if (
        "OOOOO" ===
        "" +
          board[row * sizeOfBoard + col] +
          board[(row + 1) * sizeOfBoard + col - 1] +
          board[(row + 2) * sizeOfBoard + col - 2] +
          board[(row + 3) * sizeOfBoard + col - 3] +
          board[(row + 4) * sizeOfBoard + col - 4]
      ) {
        console.log("compare success");
        return handleWin(row, col, "sub-diagonal", "O");
      }
    }
  }
  // check draw
  let isDrawing = true;
  for (let i = 0; i < sizeOfBoard; i++) {
    for (let j = 0; j < sizeOfBoard; j++) {
      if (board[i * sizeOfBoard + j] == null) {
        isDrawing = false;
      }
    }
  }
  return {
    winner: null,
    line: null,
    isDrawing: isDrawing,
  };
}
