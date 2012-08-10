/* xoxoxoai.js
 * by Erich Blume <blume.erich@gmail.com>
 * 
 * This script should be loaded before xoxoxo.js. It provides AI implementations,
 * which all follow a standard convention of taking a board state and a player
 * as input, and producing a new board state as output (such that the player given plays
 * one move on the new board).
 */


/**
 * Create a new gamestate where player has played on a random open tile.
 *
 * @param {Board} board The input game state, which will not be mutated.
 * @param {AIPlayer} player The player that should be used to mark a new tile.
 * @param {callback} callback Function to call with one argument - the new game state.
 */
function RandomAI(board,player,callback) {
  var freecells = board.allEmpty();
  if (freecells.length === 0) {
    throw new Error("Board is full, can't play anything else.");
  }
  var choice = freecells[Math.floor(Math.random()*freecells.length)]
  callback(board.changeCell(choice,player.num));
}


/**
 * Non-symetrical brute force algorithm for AI.
 *
 * Before we get in to things, let's talk a little bit about combinatorics.
 * 
 * Disregarding symmetry, tic-tac-toe has a very easy to enumerate state space: 9! = 362880.
 * This is convenient because it is also the maximum run time complexity of a brute-force AI,
 * since such an AI need only consider every single possible game state to play a perfectly
 * correct game. 362,880 is a small enough number that even a poorly written AI performing
 * this search should get through its search in well under a second. By adding a callback to
 * prevent blocking, we will have a very good user experience indeed.
 *
 * Note, though, that this method is laughably slow compaired to a more complicated and
 * intelligent AI, such as a symmetry-seeking brute AI or (even better) the provably optimal
 * 'conditional AI' which need only perform about six different heuristic checks per turn to
 * play an optimal game. But that comes later.
 *
 * @param {Board} board The input game state, which will not be mutated.
 * @param {AIPlayer} player The player that should be used to mark a new tile.
 * @param {callback} callback Function to call with one argument - the new game state.
 */
function BruteAI(board,player,callback) {
  var freecells = board.allEmpty();
  var top_scored_move; 
  var top_cored_cell;
  var checked_move;
  var next_board;
  if (freecells.length === 0) {
    throw new Error("Board is full, can't play anything else.");
  }
  // Score each possible move
  for (var i=0; i < freecells.length; i++) {
    cellnum = freecells[i];
    next_board = board.changeCell(cellnum,player.num);

    // If this move wins, just short-circuit it and go there now!
    if (next_board.hasWinner()) {
      callback(next_board);
    }

    checked_move = scoreByEnumeration(next_board,player.num,player.num);
    if ((i === 0) || compareScores(checked_move,top_scored_move)) {
      top_scored_move = checked_move;
      top_scored_cell = cellnum;
    }
  }
  callback(board.changeCell(top_scored_cellnum,player.num));
}

/**
 * Scores a move by determining the number of wins and losses it could possibly incur.
 * 
 * Each score is a tuple of wins and losses. Score X > Score Y if X.wins > Y.wins or if
 * both X.wins === Y.wins and X.losses < Y.losses.
 *
 * The wins and losses are the sum of all possible won and lost games.
 *
 * @param {Board} board The game board being scored.
 * @param {number} scoree The number of the player being scored.
 * @param {number} lastplayer The number of the player who last played.
 * @return {Score} An object with two properties: 'wins' and 'losses', both numbers.
 */
// TODO - the 'scoree' arg can be factored out by use of a closure. Not sure if I want that.
function scoreByEnumeration(board,scoree,lastplayer) {
  var freecells, running_score, nextplayer;

  // Is there a win on the board? If so, STOP!
  if (board.hasWinner()) {
    if (lastplayer === scoree) {
      return {'wins':1,'losses':0}
    } else {
      return {'wins':0,'losses':1}
    }
  } else if (board.full()) {
    // It must be a scratch game
    return {'wins':0,'losses':0}
  } else {
    // By now we know that there is a valid play remaining in the game.
    // The score of this move will just be the sum of the scores of all possible moves.
    freecells=board.allEmpty();
    // TODO - this next line needs to be abstracted out to game logic. It shouldn't live here.
    nextplayer = (lastplayer%2)+1  // Alternates between 1 and 2
    running_score = {'wins':0, 'losses':0}
    for (var i=0; i<freecells.length; i++) {
      running_score = addScore(running_score,scoreByEnumeration(
        board.changeCell(freecells[i],nextplayer),scoree,nextplayer));
    }
    return running_score;
  }
  throw new Error("All logic and reason has been abandoned. We should never have come here.");
}

/**
 * Adds the wins and losses of two scores together.
 * 
 * @param {Score} a One of the scores to be added.
 * @param {Score} b The other score to be added.
 * @return {Score} The resulting, added, score.
 */
function addScore(a,b) {
  return {'wins':a.wins+b.wins, 'losses':a.losses+b.losses}
}

/**
 * Returns true if score a is greater than score b. Wins compared first, then losses.
 *
 * @param {Score} a The score being checked
 * @param {Score} b The score being compared
 * @return {bool} a > b
 */
function compareScores(a,b) {
  return ((a.wins > b.wins) || 
          ((a.wins === b.wins) && (a.losses < b.losses)));
}
