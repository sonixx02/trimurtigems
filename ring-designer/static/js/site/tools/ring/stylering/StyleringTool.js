// StyleringTool implementation
site.StyleringTool = function(canvas, mode, pageInterface) {
    // Call parent constructor
    site.RingTool.call(this, canvas, mode, pageInterface);
    
    // Set tool type
    this.toolType = toolNames.stylering;
    
    // Default parameters
    this.defaultParams.toolInfo = {
        size: 54,
        symX: true,
        symY: false,
        symZ: true
    };

    // Camera position defaults
    this.defaultParams.init.initCamPos = {
        rotNode: {
            px: 0,
            py: 0,
            pz: 0,
            rx: -0.8,
            ry: -0.7,
            rz: -0.5
        },
        distToTarget: 550
    };

    // Initialize parameters
    this.setDefaultParams();
    
    // Ring parameters
    this.minRingVThick = 5;
    this.innerRadius = 90;
    this.radialfixTanFunctorInt = null;
    this.minThickVRingFunctor = null;
    this.styleRingDef = [];
    this.cylinderShowTimer = null;
    this.cylinderVisu = null;
    
    // Storage key for saving/loading
    this.storageKey = "skimlab-code#styleringtool";
};

// Inherit from RingTool
site.StyleringTool.prototype = Object.create(site.RingTool.prototype);
site.StyleringTool.prototype.constructor = site.StyleringTool;

// Load required files
site.StyleringTool.prototype.loadFiles = function() {
    if (this.mode === site.toolModes.edit) {
        this.filesToLoad.push("/static/js/site/tools/ring/stylering/SMDef.js");
    }
    site.RingTool.prototype.loadFiles.call(this);
};

// Load object state
site.StyleringTool.prototype.loadObject = function() {
    if (this.jsonInfo) {
        skim.engine.loadJSON(this.jsonInfo);
    }
    
    this.initFromObject(this.getSize());
    
    // Set symmetries
    skim.engine.setSymmetries({
        x: this.toolInfo.symX,
        y: this.toolInfo.symY,
        z: this.toolInfo.symZ,
        rad: false
    });
    
    // Update tool menu
    var toolInfo = this.cloneToolInfo();
    this.addPrimInfo(toolInfo);
    this.pageInterface.updateToolMenu(toolInfo);
    
    // Set accuracy level
    skim.instances.modeler.setAccuracyLevel(3);
};

// Initialize from object
site.StyleringTool.prototype.initFromObject = function(size) {
    size = size || 54;
    this.innerRadius = 1000000;
    
    // Update style ring definitions
    this.updateStyleRingDef();
    
    // Find minimum inner radius
    if (this.styleRingDef.length > 0) {
        for (var i = 0; i < this.styleRingDef.length; i++) {
            var ringDef = this.styleRingDef[i];
            for (var j = 0; j < ringDef.v.length; j++) {
                var vertex = ringDef.v[j];
                var pos = vertex.getPos();
                var radius = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
                this.innerRadius = Math.min(this.innerRadius, radius);
            }
        }
    }
    
    // Set ring parameters
    this.setRingParameters(size);
};

// Ring parameter updates
site.StyleringTool.prototype.setRingParameters = function(size) {
    var newRadius = size * 10 / (2 * Math.PI);
    var scale = newRadius / this.innerRadius;
    
    // Scale vertices
    this.radialfixTanFunctorInt.setActive(false);
    skim.engine.adjust_functors.ringRadialLimit.setActive(false);
    
    skim.engine.processVertices(function(vertex) {
        var pos = vertex.getPos();
        vertex.setPos(
            scale * pos.x,
            scale * pos.y, 
            scale * pos.z
        );
        vertex.setThickness(scale * vertex.getThickness());
    });
    
    this.innerRadius = newRadius;
    this.radialfixTanFunctorInt.setRadial(this.innerRadius);
    this.radialfixTanFunctorInt.setActive(true);
    skim.engine.adjust_functors.ringRadialLimit.setActive(true);
};

// Update style ring definitions
site.StyleringTool.prototype.updateStyleRingDef = function() {
    this.styleRingDef = [];
    var primitiveIds = Object.keys(skim.engine.vars.primitives);
    
    for (var i = 0; i < primitiveIds.length; i++) {
        var primitive = skim.engine.vars.primitives[primitiveIds[i]];
        if (primitive instanceof skim.engine.RingDef) {
            this.styleRingDef.push(primitive);
        }
    }
};

// Initialize GUI controls
site.StyleringTool.prototype.initGUI = function() {
    // Create GUI
    this.gui = new dat.GUI({ autoPlace: true });
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '60px';
    this.gui.domElement.style.right = '10px';

    // Ring parameters folder
    var ringFolder = this.gui.addFolder('Ring Parameters');
    
    // Size control
    ringFolder.add(this.toolInfo, 'size', 45, 75).step(0.5)
        .name('Ring Size (mm)')
        .onChange((value) => {
            this.setRingParameters(value);
            skim.engine.update_skeleton();
            skim.engine.update_parametrics();
            skim.engine.update_blobtree();
        });

    // Thickness control
    ringFolder.add(this, 'minRingVThick', 2, 10).step(0.5)
        .name('Min Thickness')
        .onChange((value) => {
            skim.engine.processVertices((vertex) => {
                var thickness = vertex.getThickness();
                if (thickness < value) {
                    vertex.setThickness(value);
                }
            });
            skim.engine.update_skeleton();
            skim.engine.update_parametrics();
            skim.engine.update_blobtree();
        });
    
    ringFolder.open();

    // Symmetry folder
    var symFolder = this.gui.addFolder('Symmetry');
    
    symFolder.add(this.toolInfo, 'symX')
        .name('X Symmetry')
        .onChange((value) => {
            skim.engine.setSymmetries({ x: value });
        });
        
    symFolder.add(this.toolInfo, 'symY')
        .name('Y Symmetry')
        .onChange((value) => {
            skim.engine.setSymmetries({ y: value });
        });
        
    symFolder.add(this.toolInfo, 'symZ')
        .name('Z Symmetry')
        .onChange((value) => {
            skim.engine.setSymmetries({ z: value });
        });
    
    symFolder.open();

    // Material folder
    var matFolder = this.gui.addFolder('Material');
    
    var matParams = {
        blending: this.toolInfo.prims || 'orga'
    };
    
    matFolder.add(matParams, 'blending', ['mecha', 'orga'])
        .name('Blending Style')
        .onChange((value) => {
            this.switchBlend(value);
        });
        
    matFolder.open();
};

// Utils initialization
site.StyleringTool.prototype.utilsInit = function() {
    site.RingTool.prototype.utilsInit.call(this);
    
    // Initialize cylinder visualizer
    var params = {
        innerRadius: 540 / (2 * Math.PI),
        yCenterPos: 0,
        XPlane: false,
        zLimit: 120
    };
    
    if (this.mode === site.toolModes.edit) {
        // Initialize progress display
        this.progress = new site.JweelProgress3D({
            rotation: new THREE.Euler(-Math.PI/2, 0, 0),
            position: new THREE.Vector3(0, -110, 0),
            scale: new THREE.Vector3(130, 130, 1)
        });
        
        this.cylinderVisu = new site.ForbiddenCylinder(params);
        this.cylinderVisu.setSystemAllows(true);

        // Initialize GUI controls if in edit mode
        this.initGUI();
    } else {
        this.progress = new site.JweelProgress2D(this.canvas);
        this.cylinderVisu = new site.ForbiddenCylinder(params);
        this.cylinderVisu.setSystemAllows(false);
    }
    
    this.cylinderVisu.hide();
    this.computeWarning = new site.JweelComputationWarning(this);
};