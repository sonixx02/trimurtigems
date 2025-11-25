class CartSelectManager {
    constructor(matSelect, finishContainer) {
        this.matSelect = matSelect;
        this.finishSelect = {};
        this.finishContainer = finishContainer;
        this.initialized = false;
        this.initCallbacks = [];
        this.changeCallbacks = [];
        
        // Define available materials and finishes
        this.materials = {
            'silver': ['High Gloss', 'Gloss', 'Sandblasted'],
            'gold': ['High Gloss', 'Rose Gold', 'White Gold'],
            'bronze': ['Standard'],
            'brass': ['Standard'],
            'hdss': ['Standard'],
            'titanium': ['Standard']
        };

        // Initialize after DOM is ready
        $(document).ready(() => this.init());
    }

    init() {
        if (this.initialized) return;

        // Initialize material select
        this.matSelect.selectpicker();
        
        // Create finish selects for each material
        Object.entries(this.materials).forEach(([material, finishes]) => {
            const select = $('<select>', {
                class: 'selectpicker show-tick dropup',
                'data-width': '100%'
            });
            
            finishes.forEach(finish => {
                select.append($('<option>', {
                    value: finish.toLowerCase().replace(' ', '_'),
                    text: finish
                }));
            });
            
            this.finishSelect[material] = select;
            select.hide();
            this.finishContainer.append(select);
            select.selectpicker();

            // Handle finish changes
            select.on('change', () => this.notifyChangeCallbacks());
        });

        // Show first material's finish select
        const firstMaterial = this.matSelect.val();
        if (this.finishSelect[firstMaterial]) {
            this.finishSelect[firstMaterial].show();
        }

        // Handle material changes
        this.matSelect.on('change', () => {
            const material = this.matSelect.val();
            
            // Hide all finish selects
            Object.values(this.finishSelect).forEach(select => select.hide());
            
            // Show selected material's finish select
            if (this.finishSelect[material]) {
                this.finishSelect[material].show();
            }

            this.notifyChangeCallbacks();
        });

        this.initialized = true;
        this.notifyInitCallbacks();
    }

    runWhenInitialized(callback) {
        if (this.initialized) {
            callback();
        } else {
            this.initCallbacks.push(callback);
        }
    }

    addChangeFunction(callback) {
        this.changeCallbacks.push(callback);
    }

    notifyInitCallbacks() {
        while (this.initCallbacks.length > 0) {
            const callback = this.initCallbacks.shift();
            try {
                callback();
            } catch (err) {
                console.error('Error in init callback:', err);
            }
        }
    }

    notifyChangeCallbacks() {
        this.changeCallbacks.forEach(callback => {
            try {
                callback();
            } catch (err) {
                console.error('Error in change callback:', err);
            }
        });
    }
}