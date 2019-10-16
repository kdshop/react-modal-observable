import React, {useCallback, useContext, useState} from 'react';
import {Modal, ModalContext, ModalOutlet} from "./Modal";

const App: React.FC = () => {
  const modalContext = useContext(ModalContext);
  const [visibility$] = useState(modalContext.visibilitySubject$);
  const callback = useCallback((uuid, isVisible) => visibility$.next({uuid, isVisible, outlet:'root'}), [])

  const modalWindow: React.CSSProperties = {
    width: "400px",
    height: "200px",
    backgroundColor: "beige",
    border: "10px solid steelblue",
  };

  return (
    <main>
      <ModalOutlet/>

      <Modal uuid={'modal1'}>
        <div style={modalWindow}>
          <button onClick={() => callback('modal1', false)}>✖</button>
        </div>
      </Modal>

      <button onClick={() => callback('modal1', true)}>open modal</button>
    </main>
  );
};

export default App;
