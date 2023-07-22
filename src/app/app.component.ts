import { publishFacade } from '@angular/compiler';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { BehaviorSubject, filter, switchMap, tap } from 'rxjs';
import { environment } from 'src/environment';
import { SimpleSquare, SimplePoint } from './classes/Geometries';
import { AnnotationsService } from './services/annotations.service';
import { PolygonDrawer } from './classes/PolygonDrawer';
import { Path } from 'fabric/fabric-impl';

enum WorkingMode {
  None = 1,
  Brush,
  Polygon,
  Sam
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{

  constructor(private annotationsService: AnnotationsService) { }

  workingModeEnum = WorkingMode;

  title = 'fabrictestapp';
  canvas!: fabric.Canvas;
  polygonModeActive: boolean = false;
  
  // currentPolygon: fabric.Polygon | undefined;
  currentPath : fabric.Path | undefined;
  imageId: string = 'img1';
  capturingAreaText: string = 'Active';
  capturedAreaCoordiantesText: string = "";
  $workingMode: BehaviorSubject<WorkingMode> = new BehaviorSubject<WorkingMode>(WorkingMode.None);
  polygonDrawer!: PolygonDrawer


  private $square: BehaviorSubject<SimpleSquare> = new BehaviorSubject({
    topLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 }
  });
  private capturingAreaStartPoint: SimplePoint | undefined;
  private square$ = this.$square.asObservable();
  
  ngOnInit() {
    this.square$.pipe(
      filter((s: SimpleSquare) => this.$workingMode.getValue() === WorkingMode.Sam && s.topLeft.x != s.bottomRight.x && s.topLeft.y != s.bottomRight.y),
      tap((s: SimpleSquare) => {
        if(this.$workingMode.getValue() === WorkingMode.Sam){
          this.capturedAreaCoordiantesText = 
            `Area: (${s.topLeft.x}, ${s.topLeft.y}),(${s.bottomRight.x}, ${s.bottomRight.y})`;
          }
      }),
      switchMap((s: SimpleSquare) => this.annotationsService.createAnnotations(this.imageId, s))
    ).subscribe(areas => {
      areas.forEach(points => {
        const polygon = new fabric.Polygon(points, {
          fill: 'rgba(255, 0, 0, 0.2)',
          stroke: '#000000',
          strokeWidth: 1
        });
        this.canvas.add(polygon);
        this.canvas.renderAll();
      })
    })

    this.$workingMode.subscribe(wm => {
      if(this.polygonDrawer){
        if(wm === WorkingMode.Polygon){
          this.polygonDrawer.Activate();
        } else{
          this.polygonDrawer.Deactivate();
        }

        if(wm === WorkingMode.Brush){
          this.canvas.isDrawingMode = true;
          this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
          this.canvas.freeDrawingBrush.color = 'rgba(0,0,255,0.5)'; 
          this.canvas.freeDrawingBrush.width = 30;
          this.canvas.freeDrawingCursor ='url(assets/images/brush_cursor.jpg) 10 10, auto';
        }else{
          this.canvas.isDrawingMode = false;
        }
      }
    })
  }
  
  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('drawingCancvas');
    this.polygonDrawer = new PolygonDrawer(this.canvas);
    
    fabric.Image.fromURL(`${environment.annotationsApiBaseUrl}/images/${this.imageId}`, (img) => {


        this.canvas.setDimensions({width: img.width as number, height: img.height as number});
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));

        this.canvas.on('mouse:down', this.onMouseDown.bind(this));
        this.canvas.on("mouse:up", this.onMuseUp.bind(this));
    });  
  }

  setWorkingMode(newMode: WorkingMode){
    this.$workingMode.next(newMode);
  }

  completePolygon(){
    this.polygonDrawer.FinalizeDrawing();
  }

  private onMouseDown(e: fabric.IEvent<MouseEvent>){
    switch(this.$workingMode.getValue()){
      case WorkingMode.Sam:
        this.onMouseDownSam(e);
        break;
    }
  }

  private onMuseUp(e: fabric.IEvent<MouseEvent>){
    switch(this.$workingMode.getValue()){
      case WorkingMode.Sam:
        this.onMouseUpSam(e);
        break;
    }
  }

  private onMouseDownSam(e: fabric.IEvent<MouseEvent>){
    if(e.pointer){
      this.capturingAreaStartPoint = {
        x: e.pointer.x,
        y: e.pointer.y
      };
    }
    else{
      this.capturingAreaStartPoint = undefined;
    }
  }

  private onMouseUpSam(e: fabric.IEvent<MouseEvent>){
    if(e.pointer && this.capturingAreaStartPoint){
      const endingPoint: SimplePoint = {
        x: e.pointer.x,
        y: e.pointer.y
      };

      this.$square.next(AppComponent.getSqueare(this.capturingAreaStartPoint, endingPoint));
    }
  }

  private static getSqueare(point1: SimplePoint, point2: SimplePoint): SimpleSquare {
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
