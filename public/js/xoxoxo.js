/** 
 * Given a 3x3 table jQuery element, initializes a game of tic tac toe.
 * 
 * @param {Element} table The table element, a 3x3 grid, used as a board.
 */
function tictactoe(table) {
  var game = new Game(table);
  game.startmatch();
}

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
  this.nextplayer = 0;
}

/**
 * Start a new match.
 *
 * @this {Game}
 */
Game.prototype.startmatch = function() {

  // In the future, we might put in some UI code here to signify to the user that a new
  // match is beginning. Maybe a message, a flash, etc.
  //this.board.dump();

  // Do a quick table update to clear cruft.
  this.updateTable();

  // Dispatch the next turn.
  this.nextTurn();
}

/**
 * Start a new turn. Each turn is assosciated with a player.
 *
 * @this {Game}
 */
Game.prototype.nextTurn = function() {
  var curplayer = this.players[this.nextplayer];
  var that = this;
  this.nextplayer = (this.nextplayer + 1) % this.players.length;

  curplayer.runTurn(this.table,this.board,function(newboard){
    that.playerMove(curplayer,newboard);
  });

}


/**
 * Take a player's move and validate, process, and score it.
 *
 * Possibly triggers either a new turn, or the end of the game.
 * Also, triggers redrawing the board and other UI elements.
 *
 * @this {Game}
 * @param {Player} player The player that made the move.
 * @param {Board} board The new board state after the player made the move.
 */
Game.prototype.playerMove = function(player,board) {
  // Recall that this.board is the *abstract state* of the board, and NOT the actual
  // GUI representation of the board. This function must synchronize the two!
  this.board = board;
  this.updateTable();
  this.board.dump();

  // Once a turn has completed, there are only 3 possibilities:
  // 1) Someone won. Yay!
  // 2) The game scratched. Boo!
  // 3) We are ready for the next turn. *yawn*
  if (board.hasWinner()) {
    this.winner(player);
  } else if (board.full()) {
    this.scratch();
  } else {
    this.nextTurn();
  }
}

/**
 * Trigger a 'scratch game' UI event.
 *
 * In the future, this might also start a new game or set the UI up for prompting
 * the user to start a new game.
 *
 * @this {Game}
 */
Game.prototype.scratch = function() {
  $.pnotify({
    title:"Scratch Game",
    text:"It's a tie! Oh well.",
    nonblock: true,
    hide: false,
    closer: false,
    sticker: false
  });
  $.pnotify({
    title:"WOOPS",
    text:"You'll need to reload to play again. Sorry, working on that!",
    type:"error",
    nonblock: true,
    hide: false,
    closer: false,
    sticker: false
  });
}

/**
 * Trigger a 'win game' UI event.
 * In the future, this might also start a new game or track scoring or things like that.
 *
 * @param {Player} player The player that won.
 * @this {Game}
 */
Game.prototype.winner = function(player) {
  // TODO - better coloration for wins/losses, etc.
  $.pnotify({
    title:"Player "+player.num+" wins!",
    text:"Better luck next time, other guy!", // todo - better message
    type:'success',
    nonblock: true,
    hide: false,
    closer: false,
    sticker: false
  });
  $.pnotify({
    title:"WOOPS",
    text:"You'll need to reload to play again. Sorry, working on that!",
    type:"error",
    nonblock: true,
    hide: false,
    closer: false,
    sticker: false
  });
  throw new Error("Stack tract!");
}


/**
 * Synchronize the GUI to the current game state.
 *
 * This is allowed to block, as the user is probably expecting the GUI to update
 * immediatly.
 *
 * @this {Game}
 */
Game.prototype.updateTable = function() {
  var cellid, token;
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    cellid = cellidFromCellnum(cellnum);
    if (this.board.cells[cellnum] === 0) {
      token = '';
    } else if (this.board.cells[cellnum] === 1) {
      token = 'X';
    } else {
      token = 'O';
    }
    $(cellid).text(token);
  }
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
 * Returns a cell that could be played by the player to create a fork.
 * 
 * @this {Board}
 * @param {number} player The board-number of the player to search for a threat.
 * @return {number} The cell number of the cell that creates a threat, or -1 if none.
 */
Board.prototype.forkThreat = function(player) {
  var threatened;
  var freecells = this.allEmpty();
  for (var i=0; i < freecells.length; i++) {
    threatened = this.changeCell(freecells[i],player).getAllThreatened(player);
    if (threatened.length > 1) return freecells[i];
  }
  return -1;
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

/**
 * Create a new HumanPlayer object.
 *
 * @constructor
 * @this {HumanPlayer}
 * @param {number} num The number of this player - 1 or 2.
 */
function HumanPlayer(num) {
  this.num = num;
}


/**
 * Run (without blocking too much!!!) a turn for this human player.
 * When the turn is complete, call the callback with the new board state.
 *
 * @this {HumanPlayer}
 * @param {Element} table The table element for the game.
 * @param {Board} board The current board state.
 * @param {callback} func A callback to call with one argument - the post-turn game board.
 */
HumanPlayer.prototype.runTurn = function(table,board,callback) {
  var cellid;
  $.pnotify({
    title: 'Player ' + this.num,
    text: "It's your turn!",
    type: 'info'
  });
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    cellid = cellidFromCellnum(cellnum);
    if ($(cellid).text() === '') {
      $(cellid).click(makePlayerCellClickHandler(this,table,board,cellnum,callback));
    }
  }
}

/**
 * Create new AIPlayer object.
 *
 * @constructor
 * @this {AIPlayer}
 * @param {number} num The number of this player - 1 or 2.
 */
function AIPlayer(num) {
  this.num = num;
}

/**
 * Run (without blocking too much!!!) a turn for this AI player.
 * When the turn is complete, call the callback with the new board state.
 *
 * @this {AIPlayer}
 * @param {Element} table The table element for the game. Probably NOT used for AI.
 * @param {Board} board The current board state.
 * @param {callback} func A callback to call with one argument - the post-turn game board.
 */
AIPlayer.prototype.runTurn = function(table,board,callback) {
  GoodAI(board,this,callback);
}



/******* HELPER FUNCTIONS *******/

/**
 * Return a cell ID like "#r1c2" for a cellnum like "5"
 *
 * @param {number} cellnum The number of the cell, 0-8. See Board() for docs.
 * @return {string} A jquery-compatible ID selector string like "#r1c2" for the cell.
 */
function cellidFromCellnum(cellnum) {
  var row, col;
  row = Math.floor(cellnum / 3);
  col = cellnum % 3;
  return "#r"+row+"c"+col;
}

/**
 * Return true if the cells queried all belong to one player which isn't 0
 *
 * @param {Array} cells The cell array for the board - a 9-length array of 0,1, or 2.
 * @param {number} tic The first cell to check.
 * @param {number} tac The second cell to check.
 * @param {number} toe The third cell to check.
 * @return {bool} True if the specified cells all belong to the same non-zero player.
 */ 
function checkWin(cells,tic,tac,toe) {
  return ((cells[tic] === cells[tac]) && (cells[tac] === cells[toe]) && (cells[tic] !== 0));
}


/**
 * Create a click handler for a given cell.
 *
 * @param {Player} player The player that this handler applies to.
 * @param {Element} table The table grid for the game board.
 * @param {Board} board The current game state, which may not change until callback is called.
 * @param {number} cellnum The number (0-8) of the cell that this handler is bound to.
 * @param {callback} callback The function to call when done handling, with a new board state.
 */
function makePlayerCellClickHandler(player,table,board,cellnum,callback) {
  return function(eventobj) {
    table.find('td').off('click');
    callback(board.changeCell(cellnum,player.num));
  };
}


/***** PNOTIFY Defaults *******/
$.pnotify.defaults.delay = 3000;

