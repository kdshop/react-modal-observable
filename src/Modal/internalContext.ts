import {ReplaySubject} from "rxjs";
import {
  Dispatch,
  ReactNode,
  SetStateAction
} from "react";
import {VisibilityEvent} from "./publicContext";


export class InternalContext {
  private dataBase: DataBaseType = {};
  private isRunning = false;
  public identyfiyModal$ = new ReplaySubject<{uuid: string, outlet: string}>();
  public visibility$ = new ReplaySubject<VisibilityEvent>();

  addOutlet(outlet: OutletType) {
    const {name, setState} = outlet;
    this.dataBase = {...this.dataBase, [name]: {...this.dataBase[name], setState}};
  }

  addModal(modalData: ModalType) {
    const {outlet, uuid, children} = modalData;
    this.identyfiyModal$.next({uuid, outlet});
    this.dataBase[outlet] = {
      ...this.dataBase[outlet],
      content: {
        ...this.dataBase[outlet].content,
        [uuid]: children,
      },
    };

    this.renderOutlet();

    if (!this.isRunning) {
      this.run();
      this.isRunning = true;
    }
  }

  removeModal(uuid: string) {
    this.dataBase =
      Object.fromEntries(
        Object.entries(this.dataBase).map(([name, {content, setState}]) =>
          [
            name,
            {
              setState,
              content: Object.fromEntries(
                Object.entries(content)
                  .filter(([id, ]) => id !== uuid)
              )
            }
          ]
        )
      )
  }

  getModalOutlet(uuid: string) {
    // ?
  }

  private run() {
    /** @TODO im not sure about this ¯\_(ツ)_/¯ */
    document.addEventListener('keyup', ev => {
      if (ev.code === 'Escape') {
        console.log('eskejp działa, lecimy dalej z tematem')
        // this.closeLastModal();
      }
    });
  }

  private renderOutlet() {
    Object.values(this.dataBase).forEach(outlet =>
      outlet.setState(
        outlet.content && Object.entries(outlet.content),
      )
    )
  }

}

export interface ModalType {
  uuid: string
  children: ReactNode;
  outlet: string;
}

export interface OutletType {
  name: string,
  setState: Dispatch<SetStateAction<ReactNode>>
}

interface DataBaseType {
  [name: string]: {
    setState: Dispatch<SetStateAction<ReactNode>>
    content: {
      [uuid: string]: ReactNode;
    }
  };
}
