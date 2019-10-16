import {v4} from "uuid";
import {InternalModalContext} from "./Context";
import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect, useRef,
  useState
} from "react";
import {distinctUntilChanged, filter, map, scan} from "rxjs/operators";


const Modal: React.FC<ModalPropsType> =
  ({
     children,
     isOpen = false,
     outlet = 'root',
     uuid = v4()
  }) => {
  const context = useContext(InternalModalContext);
  const [isVisible, setVisible] = useState(isOpen);
  const [id] = useState(uuid);
  const [outletName] = useState(outlet);

  useEffect(() => {
    console.log('addingModal');
    context.addModal({uuid: id, children, outlet});

    return () => context.removeModal(id);
  }, []);
  useEffect(() => setVisible(isOpen), [isOpen]);
  useEffect(() => {
    context.visibility$.next(
      {
        uuid: id,
        outlet: outletName,
        isVisible,
      }
    );
  }, [isVisible]);

  return null;
};

const Outlet : React.FC<OutletPropsType> = ({name = 'root', config = {}}) => {
  const context = useContext(InternalModalContext);
  /** Render content */
  const [state, setState] = useState();
  /** Controlling renders */
  const [render, setRender] = useState();
  /** Backdrop */
  const [visible, setVisible] = useState(true);

  context.addOutlet({name, setState});

  /** Rendering Actual Modal component from stored data */
  useEffect(() => {
    if (state) {
      const subsciption = context.visibility$.pipe(
        filter(value => value.outlet === name),
        scan((acc, value) => ({...acc, [value.uuid]: value.isVisible}), {}),
        map(value => Object.values(value).every(value1 => value1)),
        distinctUntilChanged(),
      ).subscribe(value => setVisible(value));
      setRender(
        state.map(
          ([uuid, modalContent]: any) =>
            <Window key={uuid} id={uuid} modalContent={modalContent}/>
          ),
      );

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
const Window: React.FC<WindowPropsType> = ({id, modalContent}) => {
  const [isVisible, setVisible] = useState(true);
  const context = useContext(InternalModalContext);
  const visibility$ = useRef(context.visibility$);

  /** Visibility stream for component */
  useEffect(() => {
    const subscription = visibility$.current
      .pipe(
        filter(visibilityEvent => visibilityEvent.uuid === id),
      ).subscribe(visibilityEvent => setVisible(visibilityEvent.isVisible));

    return () => subscription.unsubscribe();
  }, []);

  return isVisible ? modalContent : null;
};

interface OutletPropsType {
  name?: string;
  config?: {
    styles?: React.CSSProperties
  }
}

interface WindowPropsType {
  id: string;
  modalContent: ReactElement;
}

interface ModalPropsType {
  children: ReactNode;
  isOpen?: boolean;
  outlet?: string;
  uuid?: string;
}

export {
  Modal,
  Outlet
}
