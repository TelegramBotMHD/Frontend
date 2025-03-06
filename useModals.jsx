// src/components/useModals.jsx
import { useState, useRef, useEffect } from "react";

export function useAlertModal() {
  const [alertData, setAlertData] = useState({ open: false, text: "" });
  const triggerRef = useRef(null);
  const okButtonRef = useRef(null);

  const showAlert = (text) => {
    triggerRef.current = document.activeElement;
    setAlertData({ open: true, text });
  };

  const closeAlert = () => {
    setAlertData({ open: false, text: "" });
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }
  };

  useEffect(() => {
    if (alertData.open && okButtonRef.current) {
      okButtonRef.current.focus();
    }
  }, [alertData.open]);

  const AlertModal = alertData.open && (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    >
      <div className="bg-gray-800 p-6 rounded w-full max-w-md space-y-4">
        <p className="text-white text-lg">{alertData.text}</p>
        <div className="flex justify-end">
          <button
            ref={okButtonRef}
            onClick={closeAlert}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return { showAlert, AlertModal };
}

export function useConfirmModal() {
  const [confirmData, setConfirmData] = useState({
    open: false,
    text: "",
    onYes: () => {},
    onNo: () => {},
  });
  const triggerRef = useRef(null);
  const okButtonRef = useRef(null);

  const showConfirm = (text, onYes, onNo) => {
    triggerRef.current = document.activeElement;
    setConfirmData({ open: true, text, onYes, onNo });
  };

  const closeConfirm = () => {
    setConfirmData((prev) => ({ ...prev, open: false }));
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }
  };

  useEffect(() => {
    if (confirmData.open && okButtonRef.current) {
      okButtonRef.current.focus();
    }
  }, [confirmData.open]);

  const ConfirmModal = confirmData.open && (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    >
      <div className="bg-gray-800 p-6 rounded w-full max-w-md space-y-4">
        <p className="text-white text-lg">{confirmData.text}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              confirmData.onNo();
              closeConfirm();
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Abbrechen
          </button>
          <button
            ref={okButtonRef}
            onClick={() => {
              confirmData.onYes();
              closeConfirm();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return { showConfirm, ConfirmModal };
}
