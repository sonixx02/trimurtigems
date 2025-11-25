/* Statemachine base definition file */

var rotateCamStateMachine = {
    start : "initCamRotate",

    states : {
        initCamRotate : {
            "ctrlhelper" : "inherit",
            "enter": ["cam.automatedRotate.launch"],
            "exit" : ["cam.automatedRotate.stop"],

            "-> rotate" : {
                control: [ "mouse1:down" ]
            },
            "-> rotate2" : {
                control: [ "mouse3:down" ]
            }
        },
        camRotate : {
            "ctrlhelper" : "inherit",
            "enter": ["cam.automatedRotate.delayedlaunch"],
            "exit" : ["cam.automatedRotate.stop"],

            "-> rotate" : {
                control: [ "mouse1:down" ]
            },
            "-> rotate2" : {
                control: [ "mouse3:down" ]
            }
        },

        rotate : {
            "helper" : "Rotation",
            "enter" : [ "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],

            // don't change control helper when we go to this state
            "ctrlhelper" : "inherit",

            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> camRotate" : {
                control : [ "mouse1:up" ]
            }
        },

        rotate2 : {
            "helper" : "Rotation",
            "enter" : [ "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],

            // don't change control helper when we go to this state
            "ctrlhelper" : "inherit",

            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> camRotate" : {
                control : [ "mouse3:up" ]
            }
        }
    }
};

var handStateMachine = {
    start: "idle",

    states: {
        idle : {
            "-> shown_hand" : {
                control : [ "toggleHand", "showHand" ]
            }
        },
        shown_hand : {
            "enter" : [ "jweel.showHand", "cam.automatedRotate.stop" ],
            "exit"  : [ "jweel.hideHand"],
            "-> idle" : {
                control : [ "toggleHand", "hideHand" ]
            }
        }
    }
};

var viewCamStateMachine = {
    start: "idle",

    states: {
        idle : {
            "sub-sm" : [ rotateCamStateMachine, handStateMachine ]
        }
    }
};

var publishCamStateMachine = {
    start : "idle_rotate",

    states : {
        idle_rotate : {
            "ctrlhelper" : "inherit",

            "-> rotate" : {
                control: [ "mouse1:down" ]
            },
            "-> rotate2" : {
                control: [ "mouse3:down" ]
            }
        },

        rotate : {
            "helper" : "Rotation",
            "enter" : [ "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],

            // don't change control helper when we go to this state
            "ctrlhelper" : "inherit",

            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_rotate" : {
                control : [ "mouse1:up" ]
            }
        },

        rotate2 : {
            "helper" : "Rotation",
            "enter" : [ "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],

            // don't change control helper when we go to this state
            "ctrlhelper" : "inherit",

            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_rotate" : {
                control : [ "mouse3:up" ]
            }
        }
    }
};


