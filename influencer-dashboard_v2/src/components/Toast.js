//src/components/Toast.js
import React from "react";
import "../css/Toast.css";

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className="toast-message">{message}</div>
    </div>
  );
}

export default Toast;
