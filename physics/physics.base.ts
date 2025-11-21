export class Vector {
    components: number[] = [];

    get x() {
        return this.components[0];
    }
    set x(value: number) {
        this.components[0] = value;
    }
    
    get y() {
        return this.components[1];
    }
    set y(value: number) {
        this.components[1] = value;
    }
    
    get z() {
        return this.components[2]; // Исправлено: было [1]
    }
    set z(value: number) {
        this.components[2] = value;
    }

    constructor(...components: number[]) {
        this.components = components;
    }

    add(other: Vector): Vector {
        return new Vector(...this.components.map((c, i) => c + (other.components[i] ?? 0)));
    }

    multiplyScalar(scalar: number): Vector {
        return new Vector(...this.components.map(c => c * scalar));
    }

    divideScalar(scalar: number): Vector {
        if (scalar === 0) throw new Error("Division by zero");
        return new Vector(...this.components.map(c => c / scalar));
    }

    multiplyElementwise(other: Vector): Vector {
        return new Vector(...this.components.map((c, i) => c * (other.components[i] ?? 1)));
    }

    dot(other: Vector): number {
        return this.components.reduce((sum, c, i) => sum + c * (other.components[i] ?? 0), 0);
    }

    normalize(): Vector {
        const magnitude = this.magnitude();
        if (magnitude === 0) throw new Error("Cannot normalize zero vector");
        return this.divideScalar(magnitude);
    }

    magnitude(): number {
        return Math.sqrt(this.components.reduce((sum, c) => sum + c * c, 0));
    }

    negate(): Vector {
        return this.multiplyScalar(-1);
    }

    subtract(other: Vector): Vector {
        return new Vector(...this.components.map((c, i) => c - (other.components[i] ?? 0)));
    }

    equals(other: Vector, epsilon = 1e-10): boolean {
        return this.components.every((c, i) => 
            Math.abs(c - (other.components[i] ?? 0)) < epsilon
        );
    }

    clone(): Vector {
        return new Vector(...this.components);
    }
}