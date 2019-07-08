import { ReplaySubject } from 'rxjs';

export class Disposable {
    disposed$: ReplaySubject<boolean>;

    dispose(): void {
        this.disposed$.next(true);
        this.disposed$.complete();
    }
}
