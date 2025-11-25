// State machine definition for style ring tool
var StyleSM = {
    vertex: {
        translate: {
            name: "translate",
            mouse1: { next: "vertex.translate" },
            mousemove: { next: "vertex.translate" },
            mouse1up: { next: "vertex.idle" }
        },
        idle: {
            name: "idle",
            mouse1: { next: "vertex.translate" }
        }
    },
    prim: {
        translate: {
            name: "translate", 
            mouse1: { next: "prim.translate" },
            mousemove: { next: "prim.translate" },
            mouse1up: { next: "prim.idle" }
        },
        idle: {
            name: "idle",
            mouse1: { next: "prim.translate" }
        }
    },
    segment: {
        split: {
            name: "split",
            mouse1: { next: "segment.split" },
            mouse1up: { next: "segment.idle" }
        },
        idle: {
            name: "idle",
            mouse1: { next: "segment.split" }
        }
    },
    ring: {
        addRing: {
            name: "addRing",
            mouse1: { next: "ring.addRing" },
            mouse1up: { next: "ring.idle" }
        },
        idle: {
            name: "idle", 
            mouse1: { next: "ring.addRing" }
        }
    },
    creation: {
        mode: {
            name: "mode",
            symx: { next: "creation.mode" },
            symy: { next: "creation.mode" },
            symz: { next: "creation.mode" }
        }
    }
};