import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
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
    console.log("props", this.props);
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
    const sizeOfBoard = 5;
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
          squares: Array(9).fill(null),
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
      const col = 1 + (latestMoveSquare % 3);
      const row = 1 + Math.floor(latestMoveSquare / 3);
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
        isDrawing: false,
      };
    }
  }
  let isDrawing = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDrawing = false;
      break;
    }
  }
  return {
    winner: null,
    line: null,
    isDrawing: isDrawing,
  };
}
