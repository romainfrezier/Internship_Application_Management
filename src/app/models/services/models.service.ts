import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, delay, map, mapTo, Observable, of, switchMap, take, tap} from 'rxjs';
import { Model } from '../models/model.model';
import {environment} from "../../../environments/environment";
import {Application} from "../../applications/models/application.model";

@Injectable()
export class ModelsService {
  constructor(private http: HttpClient) {}

  maxId: number = 0;

  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  private _models$ = new BehaviorSubject<Model[]>([]);
  get models$(): Observable<Model[]> {
    return this._models$.asObservable();
  }

  private lastModelsLoad = 0;

  private setLoadingStatus(loading: boolean) {
    this._loading$.next(loading);
  }

  getModelsFromServer() {
    this.setLoadingStatus(true);

    const compareFn = (a:Model, b:Model) => {
      if (a.language < b.language)
        return -1;
      if (a.language > b.language)
        return 1;
      return 0;
    };

    this.http.get<Model[]>(`${environment.apiUrl}/models`).pipe(
      delay(1000),
      map(models => models.sort(compareFn)),
      tap(models => {
        this.lastModelsLoad = Date.now();
        this._models$.next(models);
        this.setLoadingStatus(false);
      }),
      map(models => models
        .map(model => {
            if (model.id > this.maxId){
              this.maxId = model.id;
              console.log(model.id)
            }
          }
        )
      )
    ).subscribe();
  }

  getModelById(id: number): Observable<Model> {
    if (!this.lastModelsLoad) {
      this.getModelsFromServer();
    }
    return this.models$.pipe(
      map(models => models.filter(model => model.id === id)[0])
    );
  }

  removeModel(id: number) {
    this.setLoadingStatus(true);
    this.http.delete(`${environment.apiUrl}/models/${id}`).pipe(
      delay(1000),
      switchMap(() => this.models$),
      take(1),
      map(models => models.filter(model => model.id !== id)),
      tap(models => {
        this._models$.next(models);
        this.setLoadingStatus(false);
      })
    ).subscribe();
  }

  saveModel(model: Model) {
    return this.http.post(`${environment.apiUrl}/models`, model).pipe(
      mapTo(true),
      delay(1000),
      catchError(() => of(false).pipe(
        delay(1000)
      ))
    );
  }

  updateModel(id: number, updatedModel: Model) {
    return this.http.patch(`${environment.apiUrl}/models/${id}`, updatedModel).pipe(
      mapTo(true),
      delay(1000),
      catchError(() => of(false).pipe(
        delay(1000)
      ))
    );
  }
}
