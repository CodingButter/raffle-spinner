'use client';

/**
 * Keyboard Shortcuts Help Component (Website Integration)
 */

// Simple modal implementation since Dialog component is complex
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Spin</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Reset</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">R</kbd>
            </div>
            <div className="flex justify-between">
              <span>New Session</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">N</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Export Winners</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">E</kbd>
            </div>
            <div className="flex justify-between">
              <span>Clear Winners</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift+C</kbd>
            </div>
            <div className="flex justify-between">
              <span>Help</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
