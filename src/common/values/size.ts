export class Size {
    readonly height: number;

    readonly width: number;

    constructor(params: {
        readonly height: number;
        readonly width: number;
    }) {
        this.height = params.height;
        this.width = params.width;
    }

    equals(other: Size | null | undefined): boolean {
        if (other == null)
            return false;
        return this.height === other.height && this.width === other.width;
    }

    joinHorizontally(other: Size): Size {
        if (this.height >= other.height)
            return new Size({ width: this.width + other.width * this.height / other.height, height: this.height });
        return new Size({ width: this.width * other.height / this.height + other.width, height: other.height });
    }

    scale(s: number): Size {
        return new Size({
            height: this.height * s,
            width: this.width * s,
        });
    }

    scaleToFill(other: Size): Size {
        if (this.height * other.width > other.height * this.width)
            return new Size({ height: other.height, width: this.width * other.height / this.height });
        return new Size({ height: this.height * other.width / this.width, width: other.width });
    }
}
