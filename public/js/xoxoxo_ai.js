/* xoxoxoai.js
 * by Erich Blume <blume.erich@gmail.com>
 * 
 * This script should be loaded before xoxoxo.js. It provides AI implementations,
 * which all follow a standard convention of taking a board state and a player
 * as input, and producing a new board state as output (such that the player given plays
 * one move on the new board).
 */




/************* RandomAI **************/

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


/************* BruteAI **************/

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
 * 'conditional AI' which need only perform about eight different heuristic checks per turn to
 * play an optimal game. But that comes later.
 *
 * @param {Board} board The input game state, which will not be mutated.
 * @param {AIPlayer} player The player that should be used to mark a new tile.
 * @param {callback} callback Function to call with one argument - the new game state.
 */
// TODO - there is currently a major flaw in this AI, where it will happily let you get
// a win if it thinks it can make a move that has more wins, ultimately. This is of course
// pretty stupid, but it escaped me momentarily how to encapsulte the "don't let yourself
// lose" logic without implementing the optimal AI directly, which is not the purpose of
// this AI.
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
      return;
    }

    checked_move = scoreByEnumeration(next_board,player.num,player.num);
    if ((i === 0) || compareScores(checked_move,top_scored_move)) {
      top_scored_move = checked_move;
      top_scored_cell = cellnum;
    }
  }
  callback(board.changeCell(top_scored_cell,player.num));
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
 * Returns true if score a is greater than score b.
 *
 * @param {Score} a The score being checked
 * @param {Score} b The score being compared
 * @return {bool} a > b
 */
function compareScores(a,b) {
  //return ((a.wins > b.wins) || 
  //        ((a.wins === b.wins) && (a.losses < b.losses)));
  return (a.wins - a.losses) > (b.wins - b.losses);
}



/************* GoodAI **************/

/**
 * Plays an optimal game of TicTacToe using a known best algorithm.
 *
 * Tic Tac Toe happens to have a known 'best' strategy - an algorithm you can follow to play
 * a perfect game. So, yup. Probably want to use this instead of the other ones, if winning is
 * the goal.
 *
 * @param {Board} board The input game state, which will not be mutated.
 * @param {AIPlayer} player The player that should be used to mark a new tile.
 * @param {callback} callback Function to call with one argument - the new game state.
 */
function GoodAI(board,player,callback) {
  var freecells = board.allEmpty();
  var next_board;
  // TODO - as above, this code should get moved to Game logic or something.
  var otherplayernum = (player.num%2)+1
  var otherplayercells = board.playerCells(otherplayernum);
  var otherplayerthreat;
  var forkthreat;

  // The strategy: take the first action that applies.

  // First move special: play top left corner (or any corner really):
  if (freecells.length===9) {
    callback(board.changeCell(0,player.num));
    return;
  }

  // 1) If we can, win!
  for (var i=0; i < freecells.length; i++) {
    next_board = board.changeCell(freecells[i],player.num);
    if (next_board.hasWinner()) {
      callback(next_board);
      return;
    }
  }

  // 2) Block an enemy win.
  // Consider all pairs of the other player's cells to find a potential next-turn win.
  if (otherplayercells.length > 1) {
    for (var i=0; i < otherplayercells.length; i++) {
      for (var j=(i+1); j < otherplayercells.length; j++) {
        otherplayerthreat = Board.threat(otherplayercells[i],otherplayercells[j]) 
        // If we have a threat AND the threat space is not played
        if ((otherplayerthreat >= 0) && (board.cells[otherplayerthreat] === 0)) {
          callback(board.changeCell(otherplayerthreat,player.num));
          return;
        }
      }
    }
  }

  // 3) Create a fork
  forkthreat = board.forkThreat(player.num);
  if (forkthreat >= 0) {
    callback(board.changeCell(forkthreat,player.num));
    return;
  }

  // 4) Block a fork
  // TODO - This falls short of a perfect implementation. A perfect implementation would
  // split this check in to a few phases. It would examine the fork threat and determine if
  // it can play a threat that forces the opposition to ignore its fork threat. If it can't do
  // that (IE it would force the fork anyway) then instead it should do what it's doing here -
  // play on the fork threat cell.
  //
  // It's very, very rare for this deficiency to cause this AI to lose (I think 2 games in the
  // entire game space) so I omitted it for brevity.
  forkthreat = board.forkThreat(otherplayernum);
  if (forkthreat >= 0) {
    callback(board.changeCell(forkthreat,player.num));
    return;
  }

  // 5) Play center
  if (board.cells[4] === 0) {
    callback(board.changeCell(4,player.num));
    return;
  }

  // 6) Play opposite corner
  if ((board.cells[0] === otherplayernum) && (board.cells[8] === 0)) {
    callback(board.changeCell(8,player.num));
    return;
  } else if ((board.cells[8] === otherplayernum) && (board.cells[0] === 0)) {
    callback(board.changeCell(0,player.num));
    return;
  } else if ((board.cells[2] === otherplayernum) && (board.cells[6] === 0)) {
    callback(board.changeCell(6,player.num));
    return;
  } else if ((board.cells[6] === otherplayernum) && (board.cells[2] === 0)) {
    callback(board.changeCell(2,player.num));
    return;
  }

  // 7) Play empty corner
  if (board.cells[0] === 0) {
    callback(board.changeCell(0,player.num));
    return;
  } else if (board.cells[2] === 0) {
    callback(board.changeCell(2,player.num));
    return;
  } if (board.cells[6] === 0) {
    callback(board.changeCell(6,player.num));
    return;
  } if (board.cells[8] === 0) {
    callback(board.changeCell(8,player.num));
    return;
  }

  // 8) Play empty side
  if (board.cells[1] === 0) {
    callback(board.changeCell(1,player.num));
    return;
  } else if (board.cells[3] === 0) {
    callback(board.changeCell(3,player.num));
    return;
  } if (board.cells[5] === 0) {
    callback(board.changeCell(5,player.num));
    return;
  } if (board.cells[7] === 0) {
    callback(board.changeCell(8,player.num));
    return;
  }
  // We'll never get here becasuse of steps 5, 7, and 8.
  throw new Error("AI entered inconsistent state, control flow didn't terminate.");
}





