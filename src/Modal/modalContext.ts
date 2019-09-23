import {BehaviorSubject} from "rxjs";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction
} from "react";


class Context {
  private ModalSubject = new BehaviorSubject<ModalDBType>({});
  private modalDB: ModalDBType = {};
  private outletDB: OutletDBType = {};
  private outletContentDB: OutletContentDBType = {};
  private isRunning = false;

  addOutlet(outlet: {name: string, setState: Dispatch<SetStateAction<ReactNode>>}) {
    const {name, setState} = outlet;
    this.outletDB = {...this.outletDB, [name]: setState};
  }

  addModal({uuid, ...modal}: ModalType) {
    this.modalDB = {...this.modalDB, [uuid]: modal};
    /** Sending components into internal stream */
    this.ModalSubject.next(this.modalDB);
    /** Subscribing into main Subject  */
    if (!this.isRunning) {
      this.run();
      this.isRunning = true;
    }
  }

  removeModal(uuid: string) {
    /** Deleting records from internal database  */
    this.modalDB = Object.fromEntries(Object.entries(this.modalDB).filter(([key]) => key !== uuid));
    this.outletContentDB = Object.fromEntries(Object.entries(this.outletContentDB)
      .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => key !== uuid))]));
  }

  private run() {
    /** Main storing engine */
    this.ModalSubject.subscribe(value => {
      /** Aggregating steam data accordingly to its types and unique identifiers. */

      /** Outlets */
      Object.entries(value)
        .forEach(([uuid, {outlet, children, isOpen}]) => {
          if (this.outletContentDB.hasOwnProperty(outlet)) {
            this.outletContentDB[outlet] = {...this.outletContentDB[outlet], [uuid]: {isOpen, children}}
          } else {
            this.outletContentDB[outlet] = {[uuid]: {isOpen, children}};
          }
        });

      /** Modals */
      Object.entries(this.outletContentDB)
        .forEach(([name, modalContent]) =>
          this.outletDB[name](
            Object.entries(modalContent)
              .map(([key, {isOpen, children}]) => [key, isOpen, children])
          )
        );
    });
  }
}

const ModalContext = React.createContext(new Context());

export interface ModalType {
  uuid: string
  children: ReactNode;
  isOpen: BehaviorSubject<boolean>;
  outlet: string;
}

interface ModalDBType {
  [uuid: string]: Omit<ModalType, 'uuid'>;
}

interface OutletDBType {
  [key: string]: Dispatch<SetStateAction<ReactNode>>
}

interface OutletContentDBType {
  [name: string]: {[uuid: string]: {isOpen: BehaviorSubject<boolean>; children: ReactNode}};
}

export {
  ModalContext
};
