import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className="square" onClick={() => props.onClick()}>
        <div className={props.value === 'Red' ? "circle red-player" : props.value === 'Yellow' ? "circle yellow-player" : "circle"}></div>
      </button>
    );
}

class Col extends React.Component {

    renderSquare(i) {
      return (
        <Square
          value={this.props.colValues[i]}
          onClick={() => this.props.colOnClick()}
        />
      );
    }
  
    render() {
      return (
        <div className="board-col">
          {this.renderSquare(5)}
          {this.renderSquare(4)}
          {this.renderSquare(3)}
          {this.renderSquare(2)}
          {this.renderSquare(1)}
          {this.renderSquare(0)}
        </div>
      );
    }
  }

class Board extends React.Component {
    constructor() {
        super();
        this.state = {
            boardValue: new Array(7).fill(null).map(row => new Array(6).fill(null)),
            redIsNext: true,
            winner: null
        }
    }

    filled(board) {
        for(let c = 0; c < 7; c++) {
            if(board[c][5] === null) {
                return false;
            }
        }
        return true;
    }

    miniMax(tempBoard, curPlayer, depth, alpha, beta, track) {
        let score;
        if(depth === 0 || this.filled(tempBoard) || gameOver(tempBoard)) {
            score = get_state(tempBoard);
            return score;
        }

        const opponent = (curPlayer === 'Red')? 'Yellow' : 'Red';
        var best = (curPlayer === 'Red')? 50000 : -50000;
        var pos = 3;

        for(let c = 0; c < 7; c++) {
            if(track[c] < 6) {
                //Maximizer
                if(curPlayer === 'Yellow') { 
                    tempBoard[c][track[c]] = curPlayer;
                    track[c] += 1;
                    score = this.miniMax(tempBoard, opponent, depth-1, alpha, beta, track);
                    //score = score*depth;

                    if(score > best) {
                        best = score;
                        pos = c;
                        // update alpha
                        if(best > alpha) {
                            alpha = best;
                        }

                        if(beta <= alpha) {
                            track[c] -= 1;
                            tempBoard[c][track[c]] = null;
                            break;
                        }
                    }
                    track[c] -= 1;
                    tempBoard[c][track[c]] = null;
                }
                else { //Minimizer
                    tempBoard[c][track[c]] = curPlayer;
                    track[c] += 1;
                    score = this.miniMax(tempBoard, opponent, depth-1, alpha, beta, track);
                    //score = score*depth;

                    if(score < best) {
                        best = score;
                        pos = c;
                        // update beta
                        if(best < beta) {
                            beta = best;
                        }

                        if(beta <= alpha) {
                            track[c] -= 1;
                            tempBoard[c][track[c]] = null;
                            break;
                        }
                    }
                    track[c] -= 1;
                    tempBoard[c][track[c]] = null;
                }

            }
        } //loop ends

        if(depth === 8) {
            return pos;
        }
        else {
            return best;
        }
    }

    AIplay() {
        if(this.state.winner != null || this.filled(this.state.boardValue))
            return;
        
        const val = this.state.boardValue.slice();
        const curPlayer = this.state.redIsNext? 'Red' : 'Yellow';
        
        var depth = 8;
        var track = new Array(7).fill(7);

        //Track first empty position of each column
        for(let i = 0; i < 7; i++) {
            for(let j = 0; j < 6; j++) {
                if(val[i][j] === null) {
                    track[i] = j;
                    break;
                }
            }
        }

        var pos = this.miniMax(val, curPlayer, depth, -50000, 50000, track);

        let findResult;
        for(let j = 0; j < 6; j++) {
            if(val[pos][j] === null) {
                val[pos][j] = curPlayer;
                findResult = gameOver(val);
                break;
            }
        }

        var curWinner = findResult? curPlayer : null;
        this.setState({
            boardValue: val,
            redIsNext: !this.state.redIsNext,
            winner: curWinner
        });
    }
    
    handleClick(col) {
        if(this.state.winner != null || this.filled(this.state.boardValue))
            return;

        const val = this.state.boardValue.slice();
        const curPlayer = this.state.redIsNext? 'Red' : 'Yellow';
        let findResult;

        for(let i = 0; i < 6; i++) {
            if(val[col][i] === null) {
                val[col][i] = curPlayer;
                findResult = gameOver(val);
                break; 
            }

            // reached topmost square
            if(i === 5) {
                return;
            }
        }

        var curWinner = findResult? curPlayer : null;
        this.setState({
            boardValue: val,
            redIsNext: !this.state.redIsNext,
            winner: curWinner,},() => {
            this.AIplay();
        });
    }

    renderCol(i) {
        return (
        <Col
            colValues={this.state.boardValue[i]}
            colOnClick={() => this.handleClick(i)}
        />
        );
    }

    handleReset()
    {   const val = this.state.boardValue.slice();
        for(let c = 0;c<7;c++)
        {
            for(let r = 0;r<6;r++)
            {
                val[c][r] = null;
            }
        }
        this.setState({boardValue: val,
            redIsNext : true,
            winner : null });
    }

    render() {
        var status;
        if(this.state.winner) {
            status = "Winner: " + (this.state.winner);
        }
        else if(this.filled(this.state.boardValue)) {
            status = 'Game Drawn';
        }
        else {
            status = 'Next Player: ' + (this.state.redIsNext? 'Red' : 'Yellow');
        }

        return (
            <div className="game">
                <div className="status">{status}</div>
                <div className="game-board">
                {this.renderCol(0)}
                {this.renderCol(1)}
                {this.renderCol(2)}
                {this.renderCol(3)}
                {this.renderCol(4)}
                {this.renderCol(5)}
                {this.renderCol(6)}
                </div>
                <div className="last">
                <button className="restart" onClick = {() => this.handleReset()}>
                    {'RESTART'}
                </button>
                </div>
            </div>
        );
    }
}

function calc(a, b, c, d) {
    let y = 0;
    let r = 0;

    if(a === 'Yellow') {
        y++;
    }
    if(b === 'Yellow') {
        y++;
    }
    if(c === 'Yellow') {
        y++;
    }
    if(d === 'Yellow') {
        y++;
    }

    if(a === 'Red') {
        r++;
    }
    if(b === 'Red') {
        r++;
    }
    if(c === 'Red') {
        r++;
    }
    if(d === 'Red') {
        r++;
    }

    if(y === 4 && r === 0) {
        return 5000;
    } 
    else if(y === 3 && r === 0) {
        return 50;
    } 
    else if(y === 2 && r === 0) {
        return 5;
    }
    else if(y === 0 && r === 4) {
        return -5000;
    }
    else if(y === 0 && r === 3) {
        return -50;
    }
    else if(y === 0 && r === 2) {
        return -5;
    }
    else {
        return 0;
    }
}

function get_state(tempBoard) {
    var total = 0;
    //VERTICAL
    for (let c = 0; c < 7; c++)
        for (let r = 0; r < 3; r++)
            total += calc(tempBoard[c][r], tempBoard[c][r+1], tempBoard[c][r+2], tempBoard[c][r+3]);

    //HORIZONTAL
    for (let r = 0; r < 6; r++)
        for (let c = 0; c < 4; c++)
            total += calc(tempBoard[c][r], tempBoard[c+1][r], tempBoard[c+2][r], tempBoard[c+3][r]);

    //DIAGONAL
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 4; c++)
            total += calc(tempBoard[c][r], tempBoard[c+1][r+1], tempBoard[c+2][r+2], tempBoard[c+3][r+3]);

    //ANTIDIAGONAL
    for (let r = 0; r < 3; r++)
        for (let c = 3; c < 7; c++)
            total += calc(tempBoard[c][r], tempBoard[c-1][r+1], tempBoard[c-2][r+2], tempBoard[c-3][r+3]);

    return total;
}

function check(a, b, c, d) {
    if((a != null) && (a === b) && (b ===c) && (c === d))
        return true;
    return false;
}

function gameOver(board) {
    //VERTICAL
    for (let c = 0; c < 7; c++)
        for (let r = 0; r < 3; r++)
            if (check(board[c][r], board[c][r+1], board[c][r+2], board[c][r+3]))
                return true;
    
    //HORIZONTAL
    for (let r = 0; r < 6; r++)
        for (let c = 0; c < 4; c++)
            if (check(board[c][r], board[c+1][r], board[c+2][r], board[c+3][r]))
                return true;

    //DIAGONAL
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 4; c++)
            if (check(board[c][r], board[c+1][r+1], board[c+2][r+2], board[c+3][r+3]))
                return true;

    //ANTIDIAGONAL
    for (let r = 0; r < 3; r++)
        for (let c = 3; c < 7; c++)
            if (check(board[c][r], board[c-1][r+1], board[c-2][r+2], board[c-3][r+3]))
                return true;

    return null;
}

class Game extends React.Component {
    render() {
        return (
            <div>
                <h1>Connect4</h1>
                <Board />
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);