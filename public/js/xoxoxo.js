

/**
 * Create an instance of a Game, which tracks a series of tictactoe matches.
 *
 * @constructor
 * @this {Game}
 * @param {Element} tabe The 3x3 table that makes the board.
 */
function Game(table) {
  this.board = Board(table);
  this.players = [HumanPlayer(),AIPlayer()];
  board.init();
}

/**
 * Start a new match, requiring that any previous match must have ended.
 *
 * This will automatically call this.clearmatch(), so make sure you score
 * any previous matches first!
 *
 * @this {Game}
 */
Game.prototype.startmatch() {
  throw new Error("Not yet implemented");

  // Make sure that the board is ready for a new match.
  this.clearmatch();
}

/**
 * Clear out any existing match (without scoring) to prep for a new one.
 *
 * @this {Game}
 */
Game.prototype.clearmatch() {
  throw new Error("Not yet implemented");
}

/**
 * Create an instance of a Board, which tracks the board state and provides basic logic.
 *
 * The Board class model is designed to be highly 'functional'. As a result, all manipulation
 * methods will NOT modify the current board, but will instead return a new Board object that
 * reflect the new state. This will help in many areas, not least of which being recursive game
 * tree searches.
 * 
 * @this {Board}
 * @param {Element} table The 3x3 table which makes the board.
 */
function Board(table) {
  throw new Error("Not yet implemented");
}


/**
 * Create a new HumanPlayer object.
 *
 * @this {HumanPlayer}
 */
function HumanPlayer() {
  throw new Error("Not yet implemented");
}

/**
 * Create new AIPlayer object.
 *
 * @this {AIPlayer}
 */
function AIPlayer() {
  throw new Error("Not yet implemented");
}


/** 
 * Given a 3x3 table jQuery element, initializes a game of tic tac toe.
 * 
 * @param {Element} table The table element, a 3x3 grid, used as a board.
 */
function tictactoe(table) {
  var game = Game(table)
  game.startmatch();
}




