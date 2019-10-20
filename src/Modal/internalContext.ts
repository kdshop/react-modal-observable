import {ReplaySubject} from "rxjs";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";
import {VisibilityEvent} from "./publicContext";


export class InternalContext {
  private isRunning = false;
  private dataBase: DataBaseType = {};
  /** There is no other way. I need to store internally state of modals to make decisions based on that. */
  public state: StateType = [];
  public visibility$ = new ReplaySubject<VisibilityEvent>();

  constructor() {
    /** Keep track of visibility state */
    this.visibility$
      .subscribe(({uuid, isVisible, outlet}) => {
        this.state = [
          ...this.state.filter(value => value[0] !== uuid),
          [uuid, {isVisible, outlet}],
        ];
      })
  }

  addOutlet(outlet: OutletType) {
    const {name, setState} = outlet;
    this.dataBase = {...this.dataBase, [name]: {...this.dataBase[name], setState}};
  }

  addModal(modalData: ModalType) {
    const {outlet, uuid, children} = modalData;
    this.state = [...this.state, [uuid, {outlet, isVisible: false}]];
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
    this.state = [...this.state.filter(value => value[0] !== uuid)];
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

  hideLastModal() {
    const filteredState = this.state.filter(([uuid, {outlet, isVisible}]) => isVisible);

    if (!!filteredState.length) {
      const [uuid, {outlet}]= filteredState[filteredState.length - 1];
      this.visibility$.next({uuid, outlet, isVisible: false})
    }
  }

  private run() {
    /** @TODO im not sure about this ¯\_(ツ)_/¯ */
    document.addEventListener('keyup', ev => {
      if (ev.code === 'Escape') {
        this.hideLastModal();
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

type StateType = [string, {isVisible: boolean, outlet: string}][];
