import {InternalContext} from "./internalContext";

export class PublicContext {
  constructor(
    private internalContext: InternalContext,
  ) {}
}

export interface VisibilityEvent {
  uuid: string;
  isVisible: boolean;
}