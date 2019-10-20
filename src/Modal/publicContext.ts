import {InternalContext} from "./internalContext";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";

export class PublicContext {
  constructor(
    private internalContext: InternalContext,
    private publicVisibilitySubject$ = new Subject<{uuid: string, isVisible: boolean}>()
  ) {
    publicVisibilitySubject$.pipe(
      map(({uuid, isVisible}) => {
        const {outlet} = Object.fromEntries(this.internalContext.state)[uuid];
        return {uuid, isVisible, outlet};
      }),
    ).subscribe(value => this.internalContext.visibility$.next(value));
  }

  get visibilitySubject$() {
    return this.publicVisibilitySubject$;
  }
}

export interface VisibilityEvent {
  uuid: string;
  outlet: string;
  isVisible: boolean;
}