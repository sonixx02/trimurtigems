/* Statemachine Style Ring definition file */
/* Uses base definition file               */

var hMoveStateMachine = {
    start : "idle_hmove",

    states : {
        idle_hmove : {
            "-> htranslate" : {
                helper  : [ gettext("Translater"), gettext("Déplacer")],
                control : [ "mouse1:down on vertex" ],
                helpmsg : gettext("Déplacer le sous-ensemble")
            },
            "-> htranslate_prim" : {
                control : [ "mouse1:down on segment" ]
            },

            "-> hrotate" : {
                helper  : [ gettext("Translater"), gettext("Faire pivoter (ancrage)")],
                control : [ "mouse3:down on vertex" ],
                helpmsg : gettext("Faire pivoter le sous-ensemble autour du point d'ancrage")
            },
            "-> hrotate_prim" : {
                control : [ "mouse3:down on segment" ]
            },
            "hierarchy.axis_rotate.increase" : {
                helper  : [gettext("Translater"), gettext("Faire pivoter (axe)")],
                control : [ "scroll:up on vertex" ],
                helpmsg : gettext("Faire pivoter le sous-ensemble sur lui-même")
            },
            "hierarchy.axis_rotate.decrease" : {
                control : [ "scroll:down on vertex" ]
            }
        },

        htranslate : {
            "enter" : [ "hierarchy.translate.vertex_init" ],
            "exit"  : [ "hierarchy.translate.finalize" ],
            "ctrlhelper" : "inherit",

            "hierarchy.translate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_hmove" : {
                control : [ "mouse1:up" ]
            }
        },

        htranslate_prim : {
            "enter" : [ "hierarchy.translate.prim_init" ],
            "exit"  : [ "hierarchy.translate.finalize" ],
            "ctrlhelper" : "inherit",

            "hierarchy.translate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_hmove" : {
                control : [ "mouse1:up" ]
            }
        },

        hrotate : {
            "enter" : [ "hierarchy.rotate.vertex_init" ],
            "exit"  : [ "hierarchy.rotate.finalize" ],
            "ctrlhelper" : "inherit",

            "hierarchy.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_hmove" : {
                control : [ "mouse3:up" ]
            }
        },

        hrotate_prim : {
            "enter" : [ "hierarchy.rotate.prim_init" ],
            "exit"  : [ "hierarchy.rotate.finalize" ],
            "ctrlhelper" : "inherit",

            "hierarchy.rotate.run" : {
                control : [ "mousemove" ]
            },

            "-> idle_hmove" : {
                control : [ "mouse3:up" ]
            }
        }
    }
};


var hierarchyStateMachine = {
    start : "idle_hierarchy",

    states : {
        idle_hierarchy : {
            "helper" : "idle state of hierarchy mode",
            "-> choose_anchor" : {
                //helper  : [gettext("Guide"), "change size"],
                control : [ "mousemove on vertex" ]
            }
        },

        choose_anchor : {
            "helper" : "change choose_anchor state of hierarchy mode",
            "enter"  : [ "vertex.highlight"],
            "exit"   : [ "vertex.unhighlight" ],

            "-> idle_hierarchy" : {
                //helper  : ["Translation", "Déterminer le point d'ancrage"],
                control : [ "mousemove on out" ]
            },

            "-> anchor_chosen" : {
                helper  : ["Translation", "Déterminer un point d'ancrage"],
                control : [ "mouse1:down on vertex" ]
            }
        },

        anchor_chosen : {
            "enter"  : [ "selection.setVertexUnderMouse","hierarchy.selected_vertex_as_anchor","hierarchy.color_groups" ],
            "exit"   : [ "hierarchy.uncolor_groups", "selection.unsetAllVertices"],
            "sub-sm" : [hMoveStateMachine]
        }
    }
};

var styleViewCamStateMachine = {
    start : "idle_cam",

    states : {
        idle_cam : {
            "-> rotate" : {
                helper  : [gettext("Angle de vue"), gettext("Pivoter")],
                //helper  : [gettext("Point de vue"), gettext("Pivoter")],
                control : [ "mouse3:down" ],
                helpmsg : gettext("Maintenir le clic droit pour faire pivoter la bague")
            }
        },

        rotate : {
            "helper" : gettext("Rotation"),
            "enter" : [ "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],

            "ctrlhelper" : "none",

            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },


            "-> idle_cam" : {
                control : [ "mouse3:up" ]
            }
        }
    }
};

var styleVertexModifierStateMachine = {
    start : "main",

    states : {
        main : {
            "ctrlhelper" : "inherit",

            "-> translate" : {
                helper  : [gettext("guide/Segment"), gettext("Déplacer")],
                control : [ "mouse1:down" ]
            },

            /*
            "-> thickness" : {
                helper  : ["Vertex", "Change size"],
                control : [ "mouse3:down" ]
            },
            */

            "segment.create" : {
                helper  : [gettext("guide/Segment"), gettext("Créer un segment") ],
                control : [ "dblclick" ]
            }
        },

        translate : {
            "enter" : [ "vertex.translate.init", "vertex.infos.updateInfos"],
            "exit"  : [ "vertex.translate.finalize"],
            "ctrlhelper" : "inherit",

            "vertex.translate.run" : {
                control : [ "mousemove" ]
            },

            "-> main" : {
                control : [ "mouse1:up" ]
            }
        },

        thickness : {
            "enter" : [ "vertex.thick.init" ],
            "exit"  : [ "vertex.thick.finalize" ],
            "ctrlhelper" : "inherit",

            "vertex.thick.run" : {
                control : [ "mousemove" ]
            },

            "-> main" : {
                control : [ "mouse3:up" ]
            }
        }
    }
};

var addVertexHelp  = {main:gettext("Ajouter un guide")};

var addVertexStateMachine = {
    start : "main",
    states : {
        main : {
            "ctrlhelper" : "inherit",
            "helper" : gettext("Vertex Addition"),

            "-> move_vertex" : {
            "ctrlhelper" : "inherit",
                //helper  : [addVertexHelp.main, gettext("Move on vertex")],
                control : [ "mousemove on vertex" ]
            },
            "-> move_ring" : {
            "ctrlhelper" : "inherit",
                //helper  : [addVertexHelp.main, gettext("Move on ring")],
                control : [ "mousemove on ring" ]
            },
            "-> move_segment" : {
            "ctrlhelper" : "inherit",
                //helper  : [addVertexHelp.main, gettext("Move on segment")],
                control : [ "mousemove on segment" ]
            }
        },

        move_vertex : {
            "ctrlhelper" : "inherit",
            "helper" : gettext("Bouger un guide"),

            "vertex.create" : {
                helper  : [addVertexHelp.main, addVertexHelp.main],
                control : [ "mouse1:down" ]
            },

            "-> main" : {
                control : [ "mousemove on out" ]
            }
        },

        move_ring : {
            "ctrlhelper" : "inherit",

            "vertex.create" : {
                helper  : [addVertexHelp.main, addVertexHelp.main],
                control : [ "mouse1:down" ]
            },

            "-> main" : {
                control : [ "mousemove on out" ]
            }
        },

        move_segment : {
            "ctrlhelper" : "inherit",

            "vertex.create" : {
                helper  : [addVertexHelp.main, addVertexHelp.main],
                control : [ "mouse1:down" ]
            },

            "-> main" : {
                control : [ "mousemove on out" ]
            }
        }
    }

};

var styleSegmentModifierStateMachine =  {
    start : "main",

    states : {
        main : {
            "ctrlhelper" : "inherit",
            "helper" : gettext("Edition Segment"),
            "-> translate" : {
                helper  : [gettext("Segment"), gettext("Déplacer le segment")],
                control : [ "mouse1:down" ]
            },
            "segment.split": {
                helper  : [ gettext("Segment"), gettext("Diviser")],
                control : [ "dblclick" ]
            }
        },

        translate : {
            "enter" : [ "prim.translate.init" ],
            "exit"  : [ "prim.translate.finalize" ],
            "ctrlhelper" : "none",
            "helper" : gettext("Relâchez la souris pour arrêter la translation"),

            "prim.translate.run" : {
                control : [ "mousemove" ]
            },

            "-> main" : {
                control : [ "mouse1:up" ]
            }
        }
    }
};

var styleRingModifierStateMachine = {
    start : "main",

    states : {
        main : {
            "ctrlhelper" : "inherit",
            "helper" : gettext("Edition Anneau"),
            "-> translate" : {
                helper  : [gettext("Anneau"), gettext("Déplacer l'anneau")],
                control : [ "mouse1:down" ]
            },

            "ring.split" : {
                helper  : [ gettext("Anneau"), gettext("Ajouter des guides sur l'anneau")],
                control : [ "dblclick" ]
            }

        },

        translate : {
            "enter" : [ "prim.translate.init" ],
            "exit"  : [ "prim.translate.finalize" ],
            "ctrlhelper" : "none",
            "helper" : gettext("Relâchez la souris pour arrêter la translation"),

            "prim.translate.run" : {
                control : [ "mousemove" ]
            },

            "-> main" : {
                control : [ "mouse1:up" ]
            }
        }
    }
};


var viewRenderStateMachine = {
    start : "idle_render",

    states : {
        idle_render : {
            "-> rendering" : {
                //helper  : ["render", "show surface"],
                control : [ "s:down" ]
            },
            "-> rendering_hand" : {
                //helper  : ["render", "show surface"],
                control : [ "showHand" ]
            }
        },

        rendering : {
            "enter" : [ "render.octree_show_surface"],
            "exit"  : [ "render.octree_hide_surface"],

            "-> idle_render" : {
                //helper  : ["render", "hide surface"],
                control : [ "s:down" ]
            },

            "-> rendering_hand" : {
                //helper  : ["render", "show surface"],
                control : [ "showHand" ]
            },

            "render.octreeFitGeom" : {
                //helper  : ["render", "toggle wireframe"],
                control : [ "f:down" ]
            },

            "-> camRotate": {
                control : [ "space:down" ]
            },
            "-> alternateRotate": {
                control : [ "mouse1:down" ]
            }
        },

        rendering_hand : {
            "enter" : [ "render.octree_show_surface", "jweel.showHand"],
            "exit"  : [ "render.octree_hide_surface", "jweel.hideHand"],

            "-> rendering" : {
                //helper  : ["render", "hide surface"],
                control : [ "hideHand" ]
            }
        },

        camRotate : {
            "enter": ["render.octree_show_surface", "cam.automatedRotate.launch"],
            "exit" : ["cam.automatedRotate.stop"],
            "-> rendering" : {
                control: [ "space:down", "mouse1:down", "mouse3:down" ]
            }
        },

        alternateRotate : {
            "enter" : [ "render.octree_show_surface", "cam.rotate.init" ],
            "exit"  : [ "cam.rotate.finalize" ],
            "cam.rotate.run" : {
                control : [ "mousemove" ]
            },


            "-> rendering" : {
                control : [ "mouse1:up" ]
            }
        }
    }
};

// statemachine when we have mouse on a vertex
var mergeStateMachine = {
    start : "main",

    states : {
        main : {
            "ctrlhelper" : "inherit",
            "enter"  : [ "vertex.unhighlight", "selection.unsetAllVertices" ],

            "-> highlight_vertex" : {
                control : [ "mousemove on vertex" ],
                helper  : [gettext("Guide"), gettext("Selectionner un guide")]
            }
        },

        highlight_vertex : {
            "enter" : [ "vertex.highlight" ],
            "exit"  : [ "vertex.unhighlight" ],

            "-> selected_vertex" : {
                helper  : [gettext("Guide"), gettext("Selectionner un guide")],
                control : [ "mouse1:down" ]
            },

            "-> main" : {
                control : [ "mousemove on out" ]
            }
        },

        selected_vertex : {
            "enter" : [ "selection.setVertexUnderMouse"],

            "-> out_selected_vertex" : {
                control : ["mousemove on out" ]
            },
            "-> main" : {
                control : ["mouse1:down on background"]
            }
        },

        out_selected_vertex : {

            "-> highlight_vertex2" : {
                helper  : [gettext("Guide"), gettext("Selectionner le guide à fusionner")],
                control : [ "mousemove on vertex" ]
            },
            "-> main" : {
                control : ["mouse1:down on background"]
            }
        },

        highlight_vertex2 : {
            "enter" : [ "vertex.highlight" ],
            "exit"  : [ "vertex.unhighlight" ],

            "vertex.merge" : {
                helper  : [gettext("Guide"), gettext("Fusionner avec ce guide")],
                control : [ "mouse1:down on vertex:unselected" ]
            },

            "-> out_selected_vertex" : {
                control : [ "mousemove on out" ]
            },
            "-> main" : {
                control : ["mouse1:down on background"]
            }
        }
    }
};

var oneKeyStateMachine = {
    start : "main",

    states : {
        main : {
            "creation.x_symmetry_activate_toggle":{
                control : [ "x:down" ]
            },
            "creation.y_symmetry_activate_toggle":{
                control : [ "c:down" ]
            },
            "creation.z_symmetry_activate_toggle":{
                control : [ "v:down" ]
            },
            "creation.x_symmetry_show_toggle":{
                control : [ "shift+x:down" ]
            },
            "creation.y_symmetry_show_toggle":{
                control : [ "shift+c:down" ]
            },
            "creation.z_symmetry_show_toggle":{
                control : [ "shift+v:down" ]
            },
            "ring.add":{
                control : [ "b:down" ]
            },
            "ring.addTwo":{
                control : [ "n:down" ]
            }
        }
    }
}

var styleMainStateMachine = {
    start : "viewedit",

    states : {
        /* definition of states */

        // first state is the starting state
        viewedit : {
            "helper" : gettext("Utilisez la souris pour manipuler les éléments de la scène. Maintenez une touche d'action enfoncée pour effectuer des actions spéciifiques."),
            //"enter"  : [ "helper.helperHide" ],
            //"exit"  : [ "helper.helperShow" ],
            "sub-sm" : [styleViewCamStateMachine],
            //"enter"   : [ "vertex.unhighlight_and_unselect_merge"],

            "-> vertex_modifier" : {
                //helper  : [gettext("Vertex"), gettext("Modify")],
                control : [ "mousemove on vertex" ]
            },

            "-> segment_modifier" : {
                //helper  : [ gettext("Segment"), gettext("Modify")],
                control : [ "mousemove on segment"]
            },
            "-> ring_modifier" : {
                //helper  : [ gettext("Ring"), gettext("Modify")],
                control : [ "mousemove on ring"]
            },


            "-> del" : {
                helper  : [gettext("Actions"), gettext("Supprimer")],
                control : [ "d:down", "del:down" ],
                helpmsg : gettext("Maintenir la touche") + " <kbd class='light'>" + gettext("Suppr") + "</kbd> " + gettext("ou") + "<kbd class='light'>d</kbd> " + gettext("enfoncée et cliquer sur un élément pour le supprimer")
            },
            "-> merge" : {
                helper  : [gettext("Actions"), gettext("Fusionner") ],
                control : [ "r:down" ],
                helpmsg : gettext("Maintenir la touche") +" <kbd class='light'>r</kbd> " + gettext("enfoncée, cliquer sur les extrémités de deux ou plusieurs segments pour les fusionner")
            },
            "-> vertex_adder" : {
                helper  : [gettext("Actions"), gettext("Ajouter un guide")],
                control : [ "f:down" ],
                helpmsg : gettext("Maintenir la touche") +  " <kbd class='light'>f</kbd> " + gettext("enfoncée et cliquer pour ajouter un guide. ") + "<br/>" + gettext("Double-cliquer sur le guide pour créer un segment")
            },
            "-> articulation" : {
                helper  : [gettext("Actions"), gettext("Articuler") ],
                control : [ "a:down" ],
                helpmsg : gettext("Maintenir la touche") + " <kbd class='light'>a</kbd> " + gettext("enfoncée, choisir un point d’ancrage et déplacer des sous-ensembles de la même couleur")
            },

            "cam.outputPosition" : {
                control : [ "p:down" ]
            },

            "-> zoom" : {
                helper  : [gettext("Angle de vue"), gettext("Zoomer")],
                control : [ "z:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>z</kbd> " + gettext("pour entrer dans le mode zoom")
            }

        },

        zoom : {
            "sub-sm" : [styleViewCamStateMachine],

            "cam.animZoomCursor.increase" : {
                helper  : [gettext("Angle de vue"), gettext("Zoom avant")],
                control : [ "scroll:up" ]
            },
            "cam.animZoomCursor.decrease" : {
                helper  : [gettext("Angle de vue"), gettext("Zoom arrière")],
                control : [ "scroll:down" ]
            },
            "cam.animZoomCursor.center_increase" : {
                helper  : [gettext("Angle de vue"), gettext("Centrer sur curseur")],
                control : [ "dblclick" ]
            },
            "-> viewedit" : {
                control : [ "z:up" ]
            }
        },


        articulation : {
            "helper" : gettext("Sélectionnez un point d'ancrage, puis déplacez ou tournez des groupes par rapport à ce point."),
            "exit"   : [],
            "sub-sm" : [ hierarchyStateMachine ],

            "-> viewedit" : {
                control: [ "a:up" ]
            }
        },

        del : {
            "helper" : gettext("Cliquez sur un guide pour l'effacer. Cette action effacera également les segments reliés à cette guide."),
            "exit"   : [ "vertex.unhighlight" ],

            "vertex.highlight" : {
                control: [ "mousemove on vertex" ]
            },

            "vertex.unhighlight" : {
                control: [ "mousemove on out" ]
            },

            "vertex.delUnderMouse" : {
                helper : [gettext("Supprimer"), gettext("Supprimer un guide")],
                control: [ "mouse1:down on vertex" ],
                helpmsg : gettext("Cliquer sur un guide pour le supprimer, ainsi que les segments qui lui sont associés")
            },

            "primitive.delUnderMouse" : {
                helper : [gettext("Supprimer"), gettext("Supprimer un élément")],
                control: [ "mouse1:down on segment","mouse1:down on ring" ],
                helpmsg : gettext("Cliquer sur un élément pour le supprimer")
            },

            "-> viewedit" : {
                control : [ "d:up", "del:up" ]
            }
        },

        vertex_adder : {
            "helper" : gettext("Cliquez pour ajouter un guide où vous le désirez."),
            "ctrlhelper" : "inherit",
            "sub-sm" : [ addVertexStateMachine ],

            "-> viewedit" : {
                control: [ "f:up" ]
            }
        },

        merge : {
            "helper" : gettext("Sélectionnez 2 guides pour les fusionner"),

            "sub-sm" : [ mergeStateMachine ],
            "exit"   : ["selection.unsetAllVertices"],

            "-> viewedit" : {
                control: [ "r:up" ]
            }
        },

        vertex_modifier : {
            "enter"   : [ "vertex.highlight", "vertex.infos.displayInfos", "vertex.infos.updateInfos"],
            "exit"   : [ "vertex.unhighlight", "vertex.infos.removeInfos"],
            "sub-sm" : [styleVertexModifierStateMachine, styleViewCamStateMachine],
            "helper" : "<ul><li>" + gettext("Cliquez pour déplacer") + "</li><li>" + gettext("Double-cliquez pour ajouter un segment") + "</li><li>" + gettext("Utilisez la molette pour changer la taille de la guide.") + "</li>",

            "vertex.styleWrap.thickIncrease" : {
                helper  : [gettext("Guide"), gettext("Epaissir")],
                control : [ "scroll:up", "i:down" ]
            },

            "vertex.styleWrap.thickDecrease" : {
                helper  : [gettext("Guide"), gettext("Affiner")],
                control : [ "scroll:down", "u:down" ]
            },

            "vertex.styleWrap.highlight" : {
                control: [ "mousemove on vertex" ]
            },

            "-> viewedit" : {
                control: [ "mousemove on background" ]
            },

            "-> del" : {
                //helper  : [gettext("Modes"), gettext("Delete")],
                control : [ "d:down", "del:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>" + gettext("Suppr") + "</kbd> "  + gettext(" pour effacer des guides")
            },
            "-> merge" : {
                //helper  : [gettext("Modes"), gettext("Merge") ],
                control : [ "r:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>m</kbd> " + gettext("pour entrer dans le mode fusionner")
            },
            "-> articulation" : {
                //helper  : [gettext("Modes"), gettext("Articulate") ],
                control : [ "a:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>m</kbd> " + gettext("pour entrer dans le mode articulation et bouger plusieurs guides en même temps")
            },
            "-> zoom" : {
                helper  : [gettext("Angle de vue"), gettext("Zoomer")],
                control : [ "z:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>z</kbd> " + gettext("pour entrer dans le mode zoom")
            },

            "-> vertex_adder" : {
                //helper  : [gettext("Modes"), gettext("Add Vertex")],
                control : [ "f:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>f</kbd> " + gettext("pour ajouter des guides")
            },

            "-> segment_modifier" : {
                control : [ "mousemove on segment"]
            },
            "-> ring_modifier" : {
                control : [ "mousemove on ring"]
            }
        },

        segment_modifier : {
            "sub-sm" : [styleSegmentModifierStateMachine, styleViewCamStateMachine],
            "helper" : gettext("Double-cliquez pour diviser le segment."),

            "-> viewedit" : {
                control : [ "mousemove on background" ]
            },

            "-> del" : {
                //helper  : [gettext("Modes"), gettext("Delete")],
                control : [ "d:down", "del:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>del</kbd> " + gettext("pour effacer des guides")
            },
            "-> merge" : {
                //helper  : [gettext("Modes"), gettext("Merge") ],
                control : [ "r:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>m</kbd> " + gettext("pour entrer en mode fusionner et fusionner plusieurs guides entre eux")
            },
            "-> articulation" : {
                //helper  : [gettext("Modes"), gettext("Articulate") ],
                control : [ "a:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>m</kbd> " + gettext("pour entrer dans le mode articulation et bouger plusieurs guides en même temps")
            },
            "-> zoom" : {
                helper  : [gettext("Angle de vue"), gettext("Zoomer")],
                control : [ "z:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>z</kbd> " + gettext("pour entrer dans le mode zoom")
            },

            "-> vertex_adder" : {
                //helper  : [gettext("Modes"), gettext("Add Vertex")],
                control : [ "f:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>f</kbd> " + gettext("pour ajouter des guides")
            },

            "-> vertex_modifier" : {
                control : [ "mousemove on vertex"]
            },
            "-> ring_modifier" : {
                control : [ "mousemove on ring"]
            }
        },

        ring_modifier : {
            "helper" : gettext("Double-cliquez pour ajouter des guides sur l'anneau"),
            "sub-sm" : [styleRingModifierStateMachine, styleViewCamStateMachine],

            "-> viewedit" : {
                control : [ "mousemove on background" ]
            },
            "-> del" : {
                //helper  : [gettext("Modes"), gettext("Delete")],
                control : [ "d:down", "del:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>del</kbd> " + gettext("pour effacer des guides")
            },
            "-> merge" : {
                //helper  : [gettext("Modes"), gettext("Merge")],
                control : [ "r:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>m</kbd> " + gettext("pour entrer en mode fusionner et fusionner plusieurs guides entre eux")
            },
            "-> articulation" : {
                //helper  : [gettext("Modes"), gettext("Articulate") ],
                control : [ "a:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>m</kbd> " + gettext("pour entrer dans le mode articulation et bouger plusieurs guides en même temps")
            },
            "-> zoom" : {
                helper  : [gettext("Angle de vue"), gettext("Zoomer")],
                control : [ "z:down" ],
                helpmsg : gettext("Maintenez") +" <kbd class='light'>z</kbd> " + gettext("pour entrer dans le mode zoom")
            },

            "-> vertex_adder" : {
                //helper  : [gettext("Modes"), gettext("Add Vertex")],
                control : [ "f:down" ],
                helpmsg : gettext("Maintenez") + " <kbd class='light'>f</kbd> " + gettext("pour ajouter des guides")
            },

            "-> vertex_modifier" : {
                control : [ "mousemove on vertex"]
            },
            "-> segment_modifier" : {
                control : [ "mousemove on segment"]
            }
        }
    }
};

var undoRedoSM = {
    start : "idle",

    states : {
        idle : {
            "step.prev" : {
                helper  : [gettext("Edition"), gettext("Annuler")],
                control : ["ctrl+z:down"],
                 helpmsg : gettext("Appuyer sur") +" <kbd class='light'>Ctrl</kbd> + <kbd class='light'>z</kbd> " +gettext("pour annuler vos dernières modifications")
            },

            "step.next" : {
                helper  : [gettext("Edition"), gettext("Rétablir")],
                control : ["ctrl+y:down"],
                helpmsg : gettext("Appuyer sur") + " <kbd class='light'>Ctrl</kbd> + <kbd class='light'>y</kbd> " + gettext("pour rétablir rétablir vos dernières modifications")
            }
        }
    }
};


var StyleSM = {
    start : "idle_modeler",

    states : {
        idle_modeler : {
            "sub-sm" : [ viewRenderStateMachine, oneKeyStateMachine, styleMainStateMachine, undoRedoSM ],

            "-> panic_escape_plan" : {
                control : [ "esc:down", "escape_modeler" ]
            }
        },
        // To ensure that the user won't get stuck in some modes
        // and can always press the escape key to go back to
        // the initial mode of the modeler.
        panic_escape_plan: {
            "-> idle_modeler" : {
                control : [ "esc:up", "return_modeler" ]
            }
        }
    }
};


