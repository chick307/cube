export class Range {
    readonly min: number;

    readonly max: number;

    constructor(params: {
        min: number;
        max: number;
    }) {
        this.min = params.min;
        this.max = params.max;
    }

    clamp(value: number): number {
        if (value <= this.min)
            return this.min;
        if (value <= this.max)
            return value;
        return this.max;
    }
}
