import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

@Injectable()
export class FeaturesService {
    private enabledFeatures: string[];

    constructor(private apiService: ApiService) { }

    getEnabledFeatures(): Observable<string[]> {
        return this.enabledFeatures
            ? Observable.of(this.enabledFeatures)
            : this.apiService.getNodeStatus().map(x => x.enabledFeatures)
                .map(x => this.processEnabledFeatures(x));
    }

    private processEnabledFeatures(features: string[]): string[] {
        this.enabledFeatures = features.map(x => x.substring(x.lastIndexOf('.') + 1));
        return this.enabledFeatures;
    }
}
