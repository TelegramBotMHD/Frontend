// src/components/PopoutPortal.jsx
import { createPortal } from "react-dom";

const PopoutPortal = ({ children }) => {
  return createPortal(children, document.body);
};

export default PopoutPortal;
