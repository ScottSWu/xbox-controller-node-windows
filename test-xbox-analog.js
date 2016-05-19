var XboxController = require("./xbox.js");

var controller = new XboxController();

var spaces = " "; for (var i = 0; i < 6; i++) spaces += spaces;
function analogEvent(e) {
    var analogs = controller.state.analog;
    var line1 = "";
    var line2 = "";
    for (var a in analogs) {
        var values = analogs[a].x + " " + analogs[a].y;
        line1 += a + "    ";
        line2 += values + spaces.substring(0, a.length + 4 - values.length);
    }
    console.log(line1);
    console.log(line2);
}

[
    "left-trigger",
    "right-trigger",
    "left-stick",
    "right-stick"
].forEach(function(e) {
    controller.on(e, analogEvent);
});
