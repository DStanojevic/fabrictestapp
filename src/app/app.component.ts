import { publishFacade } from '@angular/compiler';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environment';

type Point = {
  x: number,
  y: number
}

type Square = {
  topLeft: Point,
  bottomRight: Point
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  title = 'fabrictestapp';
  textInput: string = 'pera';
  canvas!: fabric.Canvas;
  polygonModeActive: boolean = false;
  
  // currentPolygon: fabric.Polygon | undefined;
  currentPath : fabric.Path | undefined;
  imageId: string = 'img1';
  capturingAreaText: string = 'Active';
  capturedAreaCoordiantesText: string = "";

  private capturingAreaActive: boolean = true;
  private polygonPoints: fabric.Point[] = [];
  private _square: BehaviorSubject<Square> = new BehaviorSubject({
    topLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 }
  });
  private capturingAreaStartPoint: Point | undefined;
  private square$ = this._square.asObservable();
  
  ngOnInit() {
    this.square$.subscribe(square => {
      if(this.capturingAreaActive){
       this.capturedAreaCoordiantesText = 
        `Area: (${square.topLeft.x}, ${square.topLeft.y}),(${square.bottomRight.x}, ${square.bottomRight.y})`;
      }
    })
  }

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('drawingCancvas');
    
    fabric.Image.fromURL(`${environment.annotationsApiBaseUrl}/images/${this.imageId}`, (img) => {
      this.canvas.setDimensions({width: img.width as number, height: img.height as number});
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));

      this.canvas.isDrawingMode = false;
      //const points = [{"x":60,"y":20},{"x":100,"y":40},{"x":100,"y":80}];
      // const initialPath = 'M 60 20 L 100 40 L 100 80 z';

      // const opts = {
      //   fill: 'transparent',
      //   stroke: '#000000',
      //   strokeWidth: 1,
      // };
      
      // this.currentPath = new fabric.Path(initialPath, opts);
      // this.canvas.add(this.currentPath);

      this.canvas.on('mouse:down', this.onMouseDown.bind(this));
      this.canvas.on("mouse:up", this.onMuseUp.bind(this));
    });  
  }

  private onMouseDown(e: fabric.IEvent<MouseEvent>){
    if(this.capturingAreaActive && e.pointer){
      this.capturingAreaStartPoint = {
        x: e.pointer.x,
        y: e.pointer.y
      };
    }
    else{
      this.capturingAreaStartPoint = undefined;
    }
  }

  private onMuseUp(e: fabric.IEvent<MouseEvent>){
    if(this.capturingAreaActive && e.pointer && this.capturingAreaStartPoint){
      const endingPoint: Point = {
        x: e.pointer.x,
        y: e.pointer.y
      };

      this._square.next(AppComponent.getSqueare(this.capturingAreaStartPoint, endingPoint));
    }
  }

  polygonMode() {
    //this.polygonModeActive = true;
    //this.canvas.isDrawingMode = false;
    //this.currentPolygon?.points?.push(new fabric.Point(60, 100));
    this.canvas.renderAll();
  }


  toggleCapturingArea() {
    if(this.capturingAreaActive){
      this.capturingAreaActive = false
      this.capturingAreaText = "Inactive"
    } else {
      this.capturingAreaActive = true
      this.capturingAreaText = "Active"
    }
  }


  private static getSqueare(point1: Point, point2: Point): Square {
    let xTopLeft: number;
    let yTopLeft: number;
    let xBottomRight: number;
    let yBottomRight: number;

    if(point1.x < point2.x){
      xTopLeft = point1.x;
      xBottomRight = point2.x;
    } else {
      xTopLeft = point2.x;
      xBottomRight = point1.x
    }

    if(point1.y < point2.y){
      yTopLeft = point1.y;
      yBottomRight = point2.y;
    } else {
      yTopLeft = point2.y;
      yBottomRight = point1.y
    }

    return {
      topLeft: {
        x: xTopLeft,
        y: yTopLeft
      },
      bottomRight: {
        x: xBottomRight,
        y: yBottomRight
      }
    }
  }
}
