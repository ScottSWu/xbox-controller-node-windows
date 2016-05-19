/**
 * Xbox 360 Controller Class
 */

var HID = require("node-hid");
var util = require("util");
var events = require("events");

var Xbox360Controller = function() {
    var self = this;
    
    // Obtain a controller device
    HID.devices().forEach(function(dev) {
        if (dev && dev.product && dev.product.indexOf("controller") >= 0) {
            self.hid = new HID.HID(dev.path);
        }
    });
    
    // Emit error event
    if (!self.hid) {
        self.emit("error", "No controller found");
        return;
    }
    
    // Set the current state
    var config = require("xbox-config.js");
    self.state = Xbox360Controller.getDefaultState();
    
    // Set listeners
    self.hid.on("data", function(buffer) {
        // Parse buffer
        var nextState = Xbox360Controller.parseState(buffer);
        var lastState = self.state;
        
        // Emit button events
        if (self.state != null) {
            for (var b in lastState.buttons) {
                var eventData = {
                    "name": b,
                    "state": nextState.buttons[b]
                };
                if (!lastState.buttons[b] && nextState.buttons[b]) {
                    // Rising edge
                    self.emit(b, eventData);
                    self.emit(b + ":down", eventData);
                }
                else if (lastState.buttons[b] && !nextState.buttons[b]) {
                    // Falling edge
                    self.emit(b, eventData);
                    self.emit(b + ":up", eventData);
                }
            }
        }
        
        // Emit analog events
        for (var a in nextState.analog) {
            if (!lastState || lastState.analog[a].x != nextState.analog[a].x || lastState.analog[a].y != nextState.analog[a].y) {
                var eventData = {
                    "name": a,
                    "x": nextState.analog[a].x,
                    "y": nextState.analog[a].y
                };
                self.emit(a, eventData);
            }
        }
    });
    
    // Emit connect event
    self.emit("connect", "Controller connected");
};

Xbox360Controller.getDefaultState = function() {
    return {
        "buttons": {
            "a": 0,
            "b": 0,
            "x": 0,
            "y": 0,
            "left-bumper": 0,
            "right-bumper": 0,
            "back": 0,
            "start": 0,
            
            "up": 0,
            "down": 0,
            "left": 0,
            "right": 0
        },
        "analog": {
            "left-trigger": {
               "x": 0, "y": 0
            },
            "right-trigger": {
                "x": 0, "y": 0
            },
            "left-stick": {
                "x": 0, "y": 0
            },
            "right-stick": {
                "x": 0, "y": 0
            }
        }
    };
};

Xbox360Controller.parseState = function(buffer) {
    var state = Xbox360Controller.getDefaultState();
    if (buffer.length != 14) {
        return state;
    }
    else {
        // TODO fill in the state
        return state;
    }
};

Xbox360Controller.prototype.constructor = Xbox360Controller;

util.inherits(Xbox360Controller, events.EventEmitter);

module.exports = Xbox360Controller;
