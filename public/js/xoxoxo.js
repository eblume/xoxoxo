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
  // Let's put in a short sleep so that the player has a chance to see the game state first.
  var that = this;
  setTimeout(function() {
    // Why JavaScript needs to become a better language:
    // if you change 'that' to 'this', the only visible effect is that the AI suddenly plays
    // just a tiny bit worse. No errors, no illegal plays - it just suddenly makes a few tiny
    // mistakes. I really wonder why (I mean I get the this/that binding issue), and I'd like
    // to study this a bit closer.
    GoodAI(board,that,callback);
  },400);
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
jQuery.pnotify.defaults.delay = 3000;

