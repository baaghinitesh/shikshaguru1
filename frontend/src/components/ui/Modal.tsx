import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import type { ModalProps } from '@/types';
import Button from './Button';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn(
          'modal-content',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Modal;