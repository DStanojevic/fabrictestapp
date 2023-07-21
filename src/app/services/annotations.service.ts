import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment';
import { fabric } from 'fabric';
import { SimpleSquare, SimplePoint } from '../classes/Geometries';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnotationsService {

  constructor(private http: HttpClient) { }

  createAnnotations(imageId: string, inputBox: SimpleSquare): Observable<fabric.Point[][]> {
    return this.http.post<SimplePoint[][]>(
      `${environment.annotationsApiBaseUrl}/images/${imageId}/annotate`, inputBox).pipe(map(AnnotationsService.mapToFabricPoint));
  }

  private static mapToFabricPoint(points: SimplePoint[][]): fabric.Point[][]{
    return points.map(pointArray => 
      pointArray.map(point => 
        new fabric.Point(point.x, point.y)
      )
    );
  }
}
