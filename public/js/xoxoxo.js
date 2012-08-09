

/**
 * Create an instance of a Game, which tracks a series of tictactoe matches.
 *
 * @constructor
 * @this {Game}
 * @param {Element} tabe The 3x3 table that makes the board.
 */
function Game(table) {
  this.board = new Board();
  this.players = [new HumanPlayer(1), new AIPlayer(2)];
  this.table = table;
}

/**
 * Start a new match.
 *
 * @this {Game}
 */
Game.prototype.startmatch() {
  throw new Error("Not yet implemented");

}

/**
 * Create an instance of a Board, which tracks the board state and provides basic logic.
 *
 * The Board class model is designed to be highly 'functional'. As a result, all manipulation
 * methods will NOT modify the current board, but will instead return a new Board object that
 * reflect the new state. This will help in many areas, not least of which being recursive
 * game tree searches.
 *
 * The cells of a board are represented as a 9-length array, the values being 0, 1, or 2. 0
 * means the cell is free, 1 means player 1 has played, 2 means player 2 has played. Each cell
 * is identified by the following layout:
 *
 *                0|1|2
 *                -+-+-
 *                3|4|5
 *                -+-+-
 *                6|7|8
 * 
 * @constructor
 * @this {Board}
 */
function Board() {

  // Populate the cells array
  this.cells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    this.cells[cellnum] = 0;     
  }
}

/**
 * Create an instance of a board by copying a previous board.
 *
 * Note that this is a 'deep' copy - the new board will not link to any of the old board's
 * state.
 *
 * @this {Board}
 * @return {Board} the new, copied board.
 */
 Board.prototype.copy = function() {
  newboard = new Board();
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    newboard.cells[cellnum] = this.cells[cellnum]; // cells contains nums, so this is a copy.
  }
  return newboard;
 }

 /**
  * Creates a new instance of a board by changing a cell from a previous board.
  *
  * @this {Board}
  * @param {number} cell The cell number, 0-8, to change.
  * @param {number} value The play value, [0,1,2], to record in this cell.
  * @return {Board} The new, modified, board.
  */
Board.prototype.changeCell = function(cell,value) {
  newboard = this.copy();
  newboard.cells[cell] = value;
  return newboard;
}

/**
 * Return a list of the cell numbers of open (unplayed) cells.
 *
 * @this {Board}
 * @return {Array} An array of open positions, possibly empty.
 */
Board.prototype.allEmpty = function() {
  var freecells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    if (this.cells[cellnum] === 0) {
      freecells[freecells.length] = cellnum;
    }
  }
  return freecells;
}


/**
 * Create a new HumanPlayer object.
 *
 * @constructor
 * @this {HumanPlayer}
 * @param {number} num The number of this player - 1 or 2.
 */
function HumanPlayer(num) {
  throw new Error("Not yet implemented");
  this.num = num;
}

/**
 * Create new AIPlayer object.
 *
 * @constructor
 * @this {AIPlayer}
 * @param {number} num The number of this player - 1 or 2.
 */
function AIPlayer(num) {
  throw new Error("Not yet implemented");
  this.num = num;
}


/** 
 * Given a 3x3 table jQuery element, initializes a game of tic tac toe.
 * 
 * @param {Element} table The table element, a 3x3 grid, used as a board.
 */
function tictactoe(table) {
  var game = new Game(table);
  game.startmatch();
}




