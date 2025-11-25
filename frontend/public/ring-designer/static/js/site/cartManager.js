// Single CartManager instance
if (typeof CartManager !== 'undefined') {
    console.warn('CartManager already defined, using existing definition');
} else {
    class CartManager {
        constructor() {
            this.minRange = 45;
            this.maxRange = 75;
            this.step = 0.5;
            this.defaultVal = 54;
            this.fileData = null;
            this.toolInfo = {};
            this.priceData = {
                updated: false,
                shipment: null,
                price: null
            };
            this.cartInfo = {
                minRange: 31,
                maxRange: 69,
                step: 1
            };
            this.currency = "EUR";
        }

        setFileData(fileData) {
            this.fileData = fileData;
            this.toolInfo.size = this.getDefaultVal();
        }

        getMinRange() {
            return this.minRange;
        }

        getMaxRange() {
            return this.maxRange;
        }

        getStep() {
            return this.step;
        }

        getDefaultVal() {
            return this.defaultVal;
        }

        setSize(value) {
            this.toolInfo.size = value;
        }

        reset_price() {
            // Reset price display
            $('.price').html('<small>Calculating price...</small>');
            $('.shipment').html('');
        }

        update_price() {
            if (!this.fileData || !this.fileData.isValid()) {
                $('.price').html('<small>No price available</small>');
                return;
            }
            this.requestPriceData();
        }

        requestPriceData() {
            // Price calculation logic
            this.reset_price();
            // Simulate price update after delay
            setTimeout(() => {
                $('.price').html('<small>Price calculation disabled</small>');
            }, 500);
        }
    }
}