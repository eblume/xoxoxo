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
  this.nextplayer = 1;
}

/**
 * Start a new match.
 *
 * @this {Game}
 */
Game.prototype.startmatch = function() {

  // In the future, we might put in some UI code here to signify to the user that a new
  // match is beginning. Maybe a message, a flash, etc.

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
  this.nextplayer = (this.nextplayer + 1) % this.players.length;

  curplayer.runTurn(function(newboard){
    this.playerMove(curplayer,newboard);
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
  noty({type:'warning',text:'Scratch Game!'});
}

/**
 * Trigger a 'win game' UI event.
 * In the future, this might also start a new game or track scoring or things like that.
 *
 * @param {Player} player The player that won.
 * @this {Game}
 */
Game.prototype.winner = function(player) {
  // TODO - Color this to be more appropriate to win/loss of a human player.
  noty({type:'success',text:'Player '+player.num+' wins!'});
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
  var freecells = [];
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    if (this.cells[cellnum] === 0) {
      freecells[freecells.length] = cellnum;
    }
  }
  return freecells;
}


/**
 * Returns true if there exists a 3-in-a-row on the board, false otherwise.
 *
 * @this {Board}
 * @return {bool} "there is a 3-in-a-row on the board"
 */
Board.prototype.hasWinner = function() {
  // There are only 8 winning combinations, so we'll just explicitly check them.
  var c = this.cells;
  return (
    // Straight through the middle
    checkWin(c,1,4,7) ||
    checkWin(c,3,4,5) ||
    // Diagnonal through the middle
    checkWin(c,0,4,8) ||
    checkWin(c,6,4,2) ||
    // Sides
    checkWin(c,0,3,6) ||
    checkWin(c,6,7,8) ||
    checkWin(c,2,5,8) ||
    checkWin(c,0,1,2) 
  );
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
  for (var cellnum = 0; cellnum < 9; cellnum++) {
    cellid = cellidFromCellnum(cellnum);
    if ($(cellid).text() !== '') {
      $(cellid).click(function(eventobj) {
        table.find('td').off('click');
        callback(board.changeCell(cellnum,this.num));
      });
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
  throw new Error("Not yet implemented");
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



/****** Noty setup *******/
// Noty sets up the notification system used here.
// This structure lists ALL the possible settings, most are unused here.
$.noty.defaults = {
  layout: 'topCenter',
  theme: 'default',
  type: 'alert',
  text: '',
  dismissQueue: true, // If you want to use queue feature set this true
  template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
  animation: {
    open: {height: 'toggle'},
    close: {height: 'toggle'},
    easing: 'swing',
    speed: 500 // opening & closing animation speed
  },
  timeout: 3000, // delay for closing event. Set false for sticky notifications
  force: false, // adds notification to the beginning of queue when set to true
  modal: false,
  closeWith: ['click'], // ['click', 'button', 'hover']
  callback: {
    onShow: function() {},
    afterShow: function() {},
    onClose: function() {},
    afterClose: function() {}
  },
  buttons: false // an array of buttons
};

