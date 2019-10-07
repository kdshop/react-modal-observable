import React, {useCallback, useState} from 'react';
import {Modal} from "./Modal";

const App: React.FC = () => {
  const [state, setState] = useState(true);
  const open = useCallback(() => setState(true), []);
  const close = useCallback(() => setState(false), []);

  const modalWindow: React.CSSProperties = {
    width: "400px",
    height: "200px",
    backgroundColor: "beige",
    border: "10px solid steelblue",
  };

  return (
    <main>
      <Modal.Outlet/>
      <Modal isOpen={state}>
        <div style={modalWindow}>
          <button onClick={close}>✖</button>
        </div>
      </Modal>

      <button onClick={open}>open modal</button>
    </main>
  );
};

export default App;
