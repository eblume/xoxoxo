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
  // TODO - memoize this. It gets called a *lot*, so beating O(n) would be nice.
  var freecells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    if (this.cells[cellnum] === 0) {
      freecells[freecells.length] = cellnum;
    }
  }
  return freecells;
}

/**
 * Return a list of the cell numbers of filled (played) cells.
 *
 * @this {Board}
 * @return {Array} An array of taken positions, possibly empty.
 */
Board.prototype.allFilled = function() {
  var closedcells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    if (this.cells[cellnum] !== 0) {
      closedcells[closedcells.length] = cellnum;
    }
  }
  return closedcells;
}

/**
 * Return a list of the cell numbers of filled (played) cells by the given player.
 *
 * @this {Board}
 * @param {number} player The number (1 or 2) of the player who's cells will be returned.
 * @return {Array} An array of taken positions, possibly empty.
 */
Board.prototype.playerCells = function(player) {
  var playercells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    if (this.cells[cellnum] === player) {
      playercells[playercells.length] = cellnum;
    }
  }
  return playercells;
}

/**
 * Class variable, being all winning combinations of 3 cells.
 */
Board.winningCells = [
  [1,4,7],
  [3,4,5],
  [0,4,8],
  [6,4,2],
  [0,3,6],
  [6,7,8],
  [2,5,8],
  [0,1,2]
];

/**
 * Returns true if there exists a 3-in-a-row on the board, false otherwise.
 *
 * @this {Board}
 * @return {bool} "there is a 3-in-a-row on the board"
 */
Board.prototype.hasWinner = function() {
  // There are only 8 winning combinations, so we'll just explicitly check them.
  var c = this.cells;
  var w;
  for (var i=0; i < Board.winningCells.length; i++) {
    w = Board.winningCells[i];
    if (checkWin(c,w[0],w[1],w[2])) {
      return true;
    }
  }
  return false;
}

/**
 * Check the board configuration for all threatened cells, and return those cells.
 *
 * A 'threatened cell' is a cell such that if the player plays on that cell, it will cause
 * that player to win. Note that by definition, a threatened cell must be empty.
 *
 * @this {Board}
 * @param {number} player The player board-number for the cells being checked.
 * @return {Array} The threatened cells, possibly empty. Only a 'fork' if length > 1.
 */
Board.prototype.getAllThreatened = function(player) {
  var freecells = this.allEmpty();
  var playercells = this.playerCells(player);
  var checkcell;
  var result = [];
  var found_index;

  for (var i=0; i < playercells.length; i++) {
    for (var j=(i+1); j < playercells.length; j++) {
      checkcell = Board.threat(playercells[i],playercells[j]);
      found_index = jQuery.inArray(checkcell,freecells);
      if (found_index >= 0) {
        result[result.length]=checkcell;
        freecells.splice(found_index,1); // Don't return the same cell twice!
      }
    }
  }

  return result;
}

/**
 * Returns all the cells that could be played by the player to create a fork.
 * 
 * @this {Board}
 * @param {number} player The board-number of the player to search for a threat.
 * @return {Array} The cell numbers of the cells that creates a fork, possibly empty.
 */
Board.prototype.forkThreat = function(player) {
  var threatened;
  var freecells = this.allEmpty();
  var result = [];
  for (var i=0; i < freecells.length; i++) {
    threatened = this.changeCell(freecells[i],player).getAllThreatened(player);
    if (threatened.length > 1) {
      result = union_arrays(result,threatened);
    }
  }
  return result;
}


/**
 * Returns true if there are no more open spots on the board, false otherwise.
 *
 * @this {Board}
 * @return {bool} "there are no open slots on the board"
 */
Board.prototype.full = function() {
  return (this.allEmpty().length === 0);
}

/**
 * Dump board state to the console for debug purposes.
 *
 * @this {Board}
 */
Board.prototype.dump = function() {
  var c = this.cells;
  console.log(""+c[0]+"|"+c[1]+"|"+c[2]);
  console.log("-+-+-");
  console.log(""+c[3]+"|"+c[4]+"|"+c[5]);
  console.log("-+-+-");
  console.log(""+c[6]+"|"+c[7]+"|"+c[8]);
  console.log("");
}


/**
 * Class function, given two cells, return the third cell that would make a win.
 *
 * Note that this does NOT check to see if the third cell is taken yet! (It can't check.)
 * 
 * @param {number} a The number of the first cell being checked.
 * @param {number} b The number of the second cell being checked.
 * @return {number} The cell that makes a win (0-8) or a negative number if no such cell.
 */
Board.threat = function(a,b){
  var test;
  var found_a;
  var found_b;
  var other_loc;

  if (a === b) {
    throw new Error("You can't tic-tac-toe with two tic's!");
  }

  for (var i = 0; i < Board.winningCells.length; i++) {
    test = Board.winningCells[i];
    found_a = false;
    found_b = false;
    // This is really ugly, but javascript seems to lack some nice features that would
    // make it much easier like comprehensions. I'd like to refactor it to something
    // cleaner later. Basically, what we're doing, is seeing if a and b are in this
    // 'win group'. If they both are, then the other element is the one we want to 
    // return.
    for (var j = 0; j < test.length; j++) {
      if (a===test[j]) {
        found_a = true;
      } else if (b==test[j]) {
        found_b = true;
      } else {
        other_loc = test[j];
      }
    }
    if (found_a && found_b) {
      return other_loc;
    }
  }
  return -1;
}

/*************** Helper Functions ***************/

/**
 * Return the union (unique-join) of two arrays.
 *
 * Thanks to KennyTM of stack overflow: http://stackoverflow.com/a/3629861/580866
 *
 * @param {Array} x The first array to join.
 * @param {Array} y The second array to join.
 * @return {Array} The resulting uniquely-joined 'union' array.
 */
function union_arrays (x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}