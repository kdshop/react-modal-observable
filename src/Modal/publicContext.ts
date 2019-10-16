import {InternalContext} from "./internalContext";

export class PublicContext {
  constructor(
    private internalContext: InternalContext,
  ) {}

  get visibilitySubject$() {
    this.internalContext.getModalOutlet('modal1');
    return this.internalContext.visibility$;
  }
}

export interface VisibilityEvent {
  uuid: string;
  outlet: string;
  isVisible: boolean;
}