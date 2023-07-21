import { fabric } from 'fabric';
import { BoundingCircle } from './BoundingCircle';
import { BehaviorSubject, Subscription } from 'rxjs';

export class PolygonDrawer {
    private boundOnMouseDownHanlder: (e: fabric.IEvent<MouseEvent>) => void;
    private boundOnMouseUpHanlder: (e: fabric.IEvent<MouseEvent>) => void;
    private boundOnMouseMoveHandler: (e: fabric.IEvent<MouseEvent>) => void;

    constructor(private canvas: fabric.Canvas){
        this.boundOnMouseDownHanlder = this.onMouseDownHanlder.bind(this);
        this.boundOnMouseUpHanlder = this.onMouseUpHandler.bind(this);
        this.boundOnMouseMoveHandler = this.onMouseMoveHandler.bind(this);
    }

    private circles: BoundingCircle[] = []
    private lines: fabric.Line[] = []
    private currentLine: fabric.Line | undefined;
    private circleRadius = 4;
   
    private $pointB = new BehaviorSubject<fabric.IPoint>({x: 0, y: 0});
    private currentPointSubscription: Subscription | undefined;

    private active = false;

    public IsActive(): boolean{
        return this.active;
    }

    public Activate(){
        if(!this.IsActive()){
            this.canvas.on('mouse:down', this.boundOnMouseDownHanlder)
            this.canvas.on('mouse:up', this.boundOnMouseUpHanlder)
            this.canvas.on('mouse:move', this.boundOnMouseMoveHandler)
            this.currentPointSubscription = this.$pointB.subscribe(p => {
                if(this.currentLine){
                    this.currentLine.set({'x2': p.x, 'y2': p.y});
                    this.canvas.renderAll();
                }
            })
            this.active = true;
        }
    }

    public Deactivate(){
        if(this.IsActive()){
            this.canvas.off('mouse:down', this.boundOnMouseDownHanlder as (e: fabric.IEvent<Event>) => void);
            this.canvas.off('mouse:up', this.boundOnMouseUpHanlder as (e: fabric.IEvent<Event>) => void);
            this.canvas.off('mouse:move', this.boundOnMouseMoveHandler as (e: fabric.IEvent<Event>) => void);
            if(this.currentPointSubscription){
                this.currentPointSubscription.unsubscribe();
            }
            this.disposeObjects();
            this.active = false;
        }
    }

    public FinalizeDrawing() {

        this.canvas.add(this.createPolygon());
        this.disposeObjects();
        this.canvas.renderAll();
    }

    private onMouseDownHanlder(e: fabric.IEvent<MouseEvent>){
        if(e.pointer){
            let newCircle: BoundingCircle;
            if(this.currentLine){
                const newLine = this.createLine(this.currentLine.x1!, this.currentLine.y1!, e.pointer.x, e.pointer.y);
                this.lines.push(newLine);
                this.canvas.add(newLine)
                this.circles[this.circles.length-1].boundingLineB = newLine;
                newCircle = this.createCircle(e.pointer, newLine, null)
            } else {
                newCircle = this.createCircle(e.pointer, null, null);
            }
            this.circles.push(newCircle);
            this.canvas.add(newCircle);
        }
    }

    private onMouseUpHandler(e: fabric.IEvent<MouseEvent>){
        if(e.pointer){
            if(this.currentLine){
                this.currentLine.x1 = e.pointer.x;
                this.currentLine.y1 = e.pointer.y;
                this.currentLine.x2 = e.pointer.x;
                this.currentLine.y2 = e.pointer.y;
            }else {
                this.currentLine = this.createLine(e.pointer.x, e.pointer.y, e.pointer.x, e.pointer.y);
                this.canvas.add(this.currentLine);
            }
        }
    }

    private onMouseMoveHandler(e: fabric.IEvent<MouseEvent>){
        if(e.pointer){
            this.$pointB.next(e.pointer);
        }
    }

    private createCircle(point: fabric.IPoint, lineA: fabric.Line | null, lineB: fabric.Line | null): BoundingCircle{
        const options = {
            left: point.x - this.circleRadius,
            top: point.y - this.circleRadius,
            strokeWidth: 3,
            radius: this.circleRadius,
            fill: '#fff',
            selectable: false,
            stroke: '#678'
        }
        return new BoundingCircle(options, lineA, lineB);
    }

    private createLine(x1: number, y1: number, x2: number, y2: number){
        return new fabric.Line([x1, y1, x2, y2], {
            fill: 'red',
            stroke: 'red',
            strokeWidth: 2,
            selectable: false,
            evented: false
        });
    }

    private createPolygon(): fabric.Polygon{
        var points = this.circles.map(c => new fabric.Point(c.left! + this.circleRadius, c.top! + this.circleRadius));
        return new fabric.Polygon(points, {
            fill: 'rgba(76, 175, 80, 0.3)',
            stroke: '#000000',
            strokeWidth: 1
          })
    }

    private disposeObjects(){
        this.lines.forEach(l => this.canvas.remove(l));
        this.lines = [];
        this.circles.forEach(c => this.canvas.remove(c));
        this.circles = [];
        if(this.currentLine){
            this.canvas.remove(this.currentLine);
            this.currentLine = undefined;
        }
    }
}