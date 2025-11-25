// Wait for dependencies before initializing
window.addEventListener('DOMContentLoaded', function() {
    // Create a promise to track all required dependencies
    const dependenciesLoaded = new Promise((resolve, reject) => {
        if (typeof THREE === 'undefined' || typeof skim === 'undefined') {
            reject(new Error('Required dependencies not loaded'));
            return;
        }
        resolve();
    });

    // Initialize skim engine only after dependencies are loaded
    dependenciesLoaded
        .then(() => {
            console.log("Initializing skim engine...");
            return new Promise((resolve, reject) => {
                try {
                    skim.init();
                    skim.instances.ready(() => {
                        console.log("Skim engine initialized successfully");
                        resolve();
                    });
                } catch (err) {
                    console.error("Failed to initialize Skim engine:", err);
                    reject(err);
                }
            });
        })
        .then(() => {
            // Initialize base tools
            if (!window.fileData) {
                window.fileData = new FileManager();
            }
            if (!window.cartData) {
                window.cartData = new CartManager();
                window.cartData.setFileData(window.fileData);
            }

            // Initialize material system
            if (window.skim && window.skim.instances) {
                if (!window.skim.instances.modeler) {
                    window.skim.instances.modeler = {
                        sceneManager: {
                            setSurfaceMaterial: function(material) {
                                console.log('Setting surface material:', material);
                            }
                        }
                    };
                }
            }

            // Signal that skim is ready
            window.skimReady = Promise.resolve();
        })
        .catch(error => {
            console.error('Initialization failed:', error);
            // Show error to user
            if (document.querySelector('.alert-surfacestopped')) {
                document.querySelector('.alert-surfacestopped').style.display = 'block';
            }
        });
});