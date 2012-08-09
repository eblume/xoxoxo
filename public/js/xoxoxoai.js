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
 * @return {Board} The new (output) game state.
 */
function RandomAI(board,player) {
  var freecells = board.allEmpty();
  if (freecells.length === 0) {
    throw new Error("Board is full, can't play anything else.");
  }
  var choice = freecells[Math.floor(Math.random()*freecells.length)]
  return board.changeCell(choice,player.num)
}
