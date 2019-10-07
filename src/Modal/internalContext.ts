import {BehaviorSubject, ReplaySubject, Subject, Subscription} from "rxjs";
import {
  Dispatch,
  ReactNode,
  SetStateAction
} from "react";
import {VisibilityEvent} from "./publicContext";


export class InternalContext {
  private ModalSubject = new BehaviorSubject<ModalDBType>({});
  private modalDB: ModalDBType = {};
  private outletDB: OutletDBType = {};
  private visibilityDB : VisibilityDBType = {};
  private outletContentDB: OutletContentDBType = {};
  private isRunning = false;
  public VisibilitySubject = new ReplaySubject<VisibilityEvent>();

  addOutlet(outlet: OutletType) {
    const {name, setState} = outlet;
    this.outletDB = {...this.outletDB, [name]: setState};
  }

  addModal(modalData: ModalType) {
    const { uuid, outlet, isOpen } = modalData;

    this.addVisibilityData(uuid, outlet, isOpen);
    this.addModalData(modalData);

    /** Subscribing into main Subject  */
    if (!this.isRunning) {
      this.run();
      this.isRunning = true;
    }
  }

  removeModal(uuid: string) {
    /** Deleting records from internal database  */
    this.removeModalData(uuid);
    this.removeVisibilityData(uuid);
    this.removeOutletData(uuid);
  }

  closeLastModal() {
    const openModals = Object.entries(this.visibilityDB).filter(([, value]) => value.isOpenValue && value.outlet in this.outletDB);
    const lastModal = openModals[openModals.length - 1];

    lastModal && this.modalVisible(lastModal[0], false);
  }

  modalVisible = (uuid: string, isVisible: boolean) => {
    if (this.visibilityDB[uuid]) {
      this.VisibilitySubject.next({uuid, isVisible});
    }
  };

  private addVisibilityData(uuid: string, outlet: string, isOpen: BehaviorSubject<boolean>) {
    this.visibilityDB = {
      ...this.visibilityDB,
      [uuid]: {
        outlet,
        isOpenStream: isOpen,
      },
    };

    this.visibilityDB = {
      ...this.visibilityDB,
      [uuid]: {
        ...this.visibilityDB[uuid],
        isOpenSubscription: isOpen.subscribe(value => {
          this.visibilityDB[uuid].isOpenValue = value;
        }),
      },
    }
  }

  private removeOutletData = (uuid: string) => this.outletContentDB = Object.fromEntries(Object.entries(this.outletContentDB)
    .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => key !== uuid))]));

  private removeModalData = (uuid: string) => this.modalDB = Object.fromEntries(Object.entries(this.modalDB).filter(([key]) => key !== uuid));

  private removeVisibilityData(uuid: string) {
      this.visibilityDB[uuid].isOpenSubscription!.unsubscribe();
      const {[uuid]: omit, ...rest} = this.visibilityDB;
      this.visibilityDB = rest;
  }

  private addModalData({uuid, ...modal}: ModalType) {
    this.modalDB = {...this.modalDB, [uuid]: modal};
    /** Sending components into internal stream */
    this.ModalSubject.next(this.modalDB);
  }

  private run() {
    document.addEventListener('keyup', ev => {
      if (ev.code === 'Escape') {
        this.closeLastModal();
      }
    });
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
          this.outletDB[name] && this.outletDB[name](
            Object.entries(modalContent)
              .map(([key, {isOpen, children}]) => [key, isOpen, children])
          )
        );
    });
  }
}

export interface ModalType {
  uuid: string
  children: ReactNode;
  isOpen: BehaviorSubject<boolean>;
  outlet: string;
}

export interface OutletType {
  name: string,
  setState: Dispatch<SetStateAction<ReactNode>>
}

interface VisibilityDBType {
  [uuid: string]: {
    outlet: string;
    isOpenStream: BehaviorSubject<boolean>;
    isOpenSubscription?: Subscription;
    isOpenValue?: boolean;
  },
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
