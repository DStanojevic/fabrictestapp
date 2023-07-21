import { fabric } from "fabric";

export class BoundingCircle extends fabric.Circle {
    constructor(optoins: Object, public boundingLineA: fabric.Line | null, public boundingLineB: fabric.Line | null) {
        super(optoins);
    }
}