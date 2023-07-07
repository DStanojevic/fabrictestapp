import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';

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
  polygonPoints: any[] = [];

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('drawingCancvas');
    
    fabric.Image.fromURL('assets/images/10x_HeLa_Kyoto.jpg', (img) => {
      this.canvas.setDimensions({width: img.width as number, height: img.height as number});
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));

      this.canvas.isDrawingMode = true;
      
      this.canvas.freeDrawingBrush.width = 5;
      this.canvas.freeDrawingBrush.color = "#000000";

      this.canvas.on('mouse:down', (options) => {
        if (this.polygonModeActive) {
          this.polygonPoints.push(options.pointer);
        }
      });
      
      this.canvas.on('mouse:up', (options) => {
        if (this.polygonModeActive) {
          this.polygonModeActive = false;
          let polygon = new fabric.Polygon(this.polygonPoints, {

            stroke: '#000000',
            strokeWidth: 1
          });
          this.canvas.add(polygon);
          this.polygonPoints = [];
        }
      });
    }, { crossOrigin: 'anonymous' });  
  }

  polygonMode() {
    this.polygonModeActive = true;
    this.canvas.isDrawingMode = false;
  }
}
