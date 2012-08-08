/* makeClickHandler(index, element)
 *
 * Assign the proper click handler to each game cell.
 *
 * index - not used here, ignore it. Instead use "elem.id" for unique IDs.
 * elem - the element that is to be assigned a click handler.
 */
var makeClickHandler = function(index,elem) {

}




/* Document Ready handler
 *
 * Attaches event handlers and/or sets initial timeouts for unobtrusive JS.
 */
$(function() {
  $("#board td").each(makeClickHandler);
});







