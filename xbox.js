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
        if (dev && dev.product && dev.product.toLowerCase().indexOf("controller") >= 0) {
            self.hid = new HID.HID(dev.path);
        }
    });
    
    // Emit error event
    if (!self.hid) {
        self.emit("error", "No controller found");
        return;
    }
    
    // Set the current state
    self.state = Xbox360Controller.getDefaultState();
    
    // Set listeners
    self.hid.on("data", function(buffer) {
        // Parse buffer
        var nextState = Xbox360Controller.parseState(buffer);
        if (!nextState) {
            nextState = self.state;
        }
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
        if (nextState != null) {
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
        }
        
        // Set the new state
        self.state = nextState;
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
            "xbox": 0,
            
            "up": 0,
            "down": 0,
            "left": 0,
            "right": 0,
            
            "upright": 0,
            "upleft": 0,
            "downright": 0,
            "downleft": 0,
            
            "left-stick": 0,
            "right-stick": 0
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
        return null;
    }
    else {
        // Regular buttons
        var buttons = {
            "a": 0x1,
            "b": 0x2,
            "x": 0x4,
            "y": 0x8,
            "left-bumper": 0x10,
            "right-bumper": 0x20,
            "back": 0x40,
            "start": 0x80
            //"xbox": ??? TODO
        };
        for (var b in buttons) {
            if ((buffer[10] & buttons[b]) == buttons[b]) {
                state.buttons[b] = 1;
            }
            else {
                state.buttons[b] = 0;
            }
        }
        
        // Stick buttons
        var sticks = buffer[11] % 4;
        if ((sticks & 0x1) == 0x1) {
            state.buttons["left-stick"] = 1;
        }
        else {
            state.buttons["left-stick"] = 0;
        }
        if ((sticks & 0x2) == 0x2) {
            state.buttons["right-stick"] = 1;
        }
        else {
            state.buttons["right-stick"] = 0;
        }
        
        // Directional pad
        var dpad = buffer[11] - sticks;
        var directions = {
            "up": 0x04,
            "down": 0x14,
            "left": 0x1c,
            "right": 0x0c,
            
            "upright": 0x08,
            "upleft": 0x20,
            "downright": 0x10,
            "downleft": 0x18
        };
        
        // Analog
        state.analog["left-trigger"].x  = (buffer[9] > 0x80) ? buffer[9] - 0x80 : 0;
        state.analog["right-trigger"].x = (buffer[9] < 0x80) ? 0x80 - buffer[9] : 0;
        state.analog["left-stick"].x    = buffer[0] | (buffer[1] << 8);
        state.analog["left-stick"].y    = buffer[2] | (buffer[3] << 8);
        state.analog["right-stick"].x   = buffer[4] | (buffer[5] << 8);
        state.analog["right-stick"].y   = buffer[6] | (buffer[7] << 8);
        
        return state;
    }
};

Xbox360Controller.prototype.constructor = Xbox360Controller;

util.inherits(Xbox360Controller, events.EventEmitter);

module.exports = Xbox360Controller;
