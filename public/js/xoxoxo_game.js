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