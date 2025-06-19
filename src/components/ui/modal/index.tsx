import React, { Fragment, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { Button } from '../button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <Fragment>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 rounded-full"
              onClick={onClose}
            >
              <FiX className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </Fragment>
  );

  // Use portal to render modal outside of the normal DOM hierarchy
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
