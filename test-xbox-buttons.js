var XboxController = require("xbox.js");

var controller = new XboxController();

function buttonEvent(e) {
    console.log(e + " " + (e.state == 0) ? "released" : "pressed");
}

[
    "a:down", "a:up",
    "b:down", "b:up",
    "x:down", "x:up",
    "y:down", "y:up"
].forEach(function(e) {
    controller.on(e, buttonEvent);
});
