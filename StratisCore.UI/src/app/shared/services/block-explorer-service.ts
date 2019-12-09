import { Injectable } from '@angular/core';
import { RestApi } from "@shared/services/rest-api";
import { GlobalService } from "@shared/services/global.service";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "@shared/services/error-service";
import { BehaviorSubject, Observable } from "rxjs";
import { BlockItem } from "@shared/services/interfaces/block-explorer-types.i";

@Injectable({
  providedIn: 'root'
})
export class BlockExplorerService extends RestApi {
  private blockSubject = new BehaviorSubject<BlockItem[]>([]);
  public loading =new BehaviorSubject<boolean>(false);

  constructor(globalService: GlobalService,
              httpClient: HttpClient,
              errorService: ErrorService) {
    super(globalService, httpClient, errorService, 'https://stratismainindexer1.azurewebsites.net/api');
    this.paginateBlocks()
  }

  public get blocks(): Observable<BlockItem[]> {
    return this.blockSubject.asObservable()
  }

  private paginateBlocks(start: number = 0, blockCount: number = 40): void {
    this.loading.next(true);
     this.get<BlockItem[]>(`v1/blocks/top?start=${start}&top=${blockCount}`).toPromise().then(result => {
      this.blockSubject.next(result);
      this.loading.next(false)
    });
  }
}
