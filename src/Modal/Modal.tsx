import {BehaviorSubject, combineLatest} from "rxjs";
import {v4} from "uuid";
import {InternalModalContext} from "./Context";
import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import {filter} from "rxjs/operators";


const Modal: ModalComposition & React.FC<ModalPropsType> = ({isOpen, children, outlet = 'root', uuid = v4()}) => {
  const context = useContext(InternalModalContext);
  /** Generating static identifier */
  const [id] = useState(uuid);
  const [subject] = useState(new BehaviorSubject(isOpen));
  const [visible, setVisible] = useState(isOpen);

  /** Sending Modal component */
  useEffect(() => {
    context.addModal({uuid: id, children, isOpen: subject, outlet});

    return () => {
      context.removeModal(uuid);
      subject.unsubscribe();
    };
  }, []);

  /** Tutaj */
  useEffect(() => {
    const subscription = context.VisibilitySubject
      .pipe(
        filter(visibilityEvent => visibilityEvent.uuid === uuid),
      ).subscribe(visibilityEvent => setVisible(visibilityEvent.isVisible));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => subject.next(visible), [visible]);
  useEffect(() => setVisible(isOpen), [isOpen]);
  console.log(123);
  /** Controlling component */

  return null;
};

const Outlet : React.FC<OutletPropsType> = ({name = 'root', config = {}}) => {
  const context = useContext(InternalModalContext);
  /** Render content */
  const [state, setState] = useState();
  /** Controlling renders */
  const [render, setRender] = useState();
  /** Backdrop */
  const [visible, setVisible] = useState(false);

  context.addOutlet({name, setState});

  /** Rendering Actual Modal component from stored data */
  useEffect(() => {
    if (state) {
      setRender(state.map(([uuid, isOpen, modalContent]: any) => <Window key={uuid} isOpen={isOpen} modalContent={modalContent}/>));
      const outletObservables = state.reduce((cV:any, [, isOpen]:any) => [...cV, isOpen], []);
      const subsciption = combineLatest(outletObservables).subscribe(val => setVisible(val.some(el => el)));

      return () => subsciption.unsubscribe();
    }
  }, [state]);

  /** Styles */
  const stylez: React.CSSProperties = {...{
      position: "absolute",
      width: "100%",
      minHeight: "100%",
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
  uuid?: string;
}

/** @TODO There is no autocompleate in JSX, fix this or change pattern... */
export interface ModalComposition {
  Outlet: typeof Outlet;
}

Modal.Outlet = Outlet;

export {
  Modal,
}
