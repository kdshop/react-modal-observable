import React from "react";
import {InternalContext} from "./internalContext";
import {PublicContext} from "./publicContext";


const privateContextInstance = new InternalContext();
const publicContextInstance = new PublicContext(privateContextInstance);

const InternalModalContext = React.createContext(privateContextInstance);
const ModalContext = React.createContext(publicContextInstance);

export {
  InternalModalContext,
  ModalContext,
}
