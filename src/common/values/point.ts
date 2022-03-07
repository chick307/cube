export type PointJson = {
    x: number;

    y: number;
};

export class Point {
    readonly x: number;

    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromJson(json: unknown): Point;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): Point {
        if (typeof json !== 'object' && json === null)
            throw Error();
        const { x, y } = json;
        if (typeof x !== 'number' || typeof y !== 'number')
            throw Error();
        return new Point(x, y);
    }

    equals(otherPoint: Point | null | undefined): boolean {
        return otherPoint != null && otherPoint.x === this.x && otherPoint.y === this.y;
    }

    toJson(): PointJson {
        return {
            x: this.x,
            y: this.y,
        };
    }
}
