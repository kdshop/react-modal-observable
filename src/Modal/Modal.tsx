import {BehaviorSubject, combineLatest} from "rxjs";
import {v4} from "uuid";
import {ModalContext} from "./modalContext";
import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

const Modal: ModalComposition & React.FC<ModalPropsType> = ({isOpen, children, outlet = 'root'}) => {
  const contekst = useContext(ModalContext);
  /** Generating static identifier */
  const [uuid] = useState(v4());
  const [subject] = useState(new BehaviorSubject(isOpen));

  /** Sending Modal component */
  useEffect(() => {
    contekst.addModal({uuid, children, isOpen: subject, outlet});

    return () => {
      contekst.removeModal(uuid);
      subject.unsubscribe();
    };
  }, []);

  /** Controlling component */
  useEffect(() => subject.next(isOpen), [isOpen]);

  return null;
};

const Outlet : React.FC<OutletPropsType> = ({name = 'root', config = {}}) => {
  const contekst = useContext(ModalContext);
  /** Render content */
  const [state, setState] = useState();
  /** Controlling renders */
  const [render, setRender] = useState();
  /** Backdrop */
  const [visible, setVisible] = useState(false);

  contekst.addOutlet({name, setState});

  /** Rendering Actual Modal component from stored data */
  useEffect(() => {
    if (state) {
      setRender(state.map(([uuid, isOpen, modalContent]: any) => <Window key={uuid} isOpen={isOpen} modalContent={modalContent}/>));
      const outletObservables = state.reduce((cV:any, [, isOpen]:any) => [...cV, isOpen], []);
      combineLatest(outletObservables).subscribe(val => setVisible(val.some(el => el)));
    }
  }, [state]);

  /** Styles */
  const stylez: React.CSSProperties = {...{
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 10,
      display: "grid",
      justifyItems: "center",
      alignItems: "center",
    },
    ...config.styles,
  };

  return render && visible ? (
    <div style={{...stylez}}>
      {render}
    </div>
  ) : null;
};

/** Returning actual content */
const Window: React.FC<WindowPropsType> = ({isOpen, modalContent}) => {
  const [visible, setVisible] = useState(true);

  /** Visibility stream for component */
  useEffect(() => {
    const subscription = isOpen.subscribe((isOpen) => setVisible(isOpen));

    return () => subscription.unsubscribe()
  }, []);

  return visible ? modalContent : null;
};

interface OutletPropsType {
  name?: string;
  config?: {
    styles?: React.CSSProperties
  }
}

interface WindowPropsType {
  isOpen: BehaviorSubject<boolean>;
  modalContent: ReactElement;
}

interface ModalPropsType {
  isOpen: boolean;
  children: ReactNode;
  outlet?: string;
}

/** @TODO There is no autocompleate in JSX, fix this or change pattern... */
export interface ModalComposition {
  Outlet: typeof Outlet;
}

Modal.Outlet = Outlet;

export {
  Modal,
}
