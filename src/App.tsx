import React, {useCallback, useState} from 'react';
import {Modal} from "./Modal";

const App: React.FC = () => {
  const [state, setState] = useState(true);
  const onClick = useCallback(() => setState(state => !state), []);

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
          <button onClick={onClick}>✖</button>
        </div>
      </Modal>

      <button onClick={onClick}>open modal</button>
    </main>
  );
};

export default App;
