var XboxController = require("./xbox.js");

var controller = new XboxController();

function buttonEvent(e) {
    console.log(e.name + " " + ((e.state == 0) ? "released" : "pressed"));
}

[
    "a:down", "a:up",
    "b:down", "b:up",
    "x:down", "x:up",
    "y:down", "y:up",
    "left-bumper:down", "left-bumper:up",
    "right-bumper:down", "right-bumper:up",
    "back:down", "back:up",
    "start:down", "start:up",
    "left-stick:down", "left-stick:up",
    "right-stick:down", "right-stick:up"
].forEach(function(e) {
    controller.on(e, buttonEvent);
});
