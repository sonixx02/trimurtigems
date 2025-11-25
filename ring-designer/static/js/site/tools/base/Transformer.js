// Transformer class definition for the ring designer
class Transformer {
    constructor() {
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.matrix = new THREE.Matrix4();
        this._update();
    }

    _update() {
        this.matrix.compose(
            this.position,
            new THREE.Quaternion().setFromEuler(this.rotation),
            this.scale
        );
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this._update();
        return this;
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        this._update();
        return this;
    }

    setScale(x, y, z) {
        this.scale.set(x, y, z);
        this._update();
        return this;
    }

    getMatrix() {
        return this.matrix;
    }

    reset() {
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.scale.set(1, 1, 1);
        this._update();
        return this;
    }

    transformPoint(point) {
        return point.clone().applyMatrix4(this.matrix);
    }

    transformDirection(dir) {
        return dir.clone().transformDirection(this.matrix);
    }

    copy(transformer) {
        this.position.copy(transformer.position);
        this.rotation.copy(transformer.rotation);
        this.scale.copy(transformer.scale);
        this._update();
        return this;
    }

    clone() {
        const transformer = new Transformer();
        return transformer.copy(this);
    }
}

// Make it globally available
window.Transformer = Transformer;