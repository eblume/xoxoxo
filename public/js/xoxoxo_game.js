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
  //this.board.dump();
  $.pnotify({
    title:"Starting a new game!",
    type:'success',
  });
  this.board = new Board();
  this.nextplayer = 0;

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
  //this.board.dump();

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
  });
  this.finishGame();
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
  var other_player=(player.num%2)+1
  $.pnotify({
    title:"Player "+player.num+" wins!",
    text:"Better luck next time, Player "+other_player+"!",
    type:'success',
  });
  this.finishGame();
}

/**
 * Perform end-of-game (post-scoring) things. UI updates, new game prep, that sort of thing.
 *
 * @this {Game}
 */
Game.prototype.finishGame = function() {
  var that = this;
  this.table.find("caption").text("Starting a new game in 5 seconds...");
  setTimeout(function(){
    that.table.find("caption").text("Would you like to play a game?");
    that.startmatch();
  },5000);
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