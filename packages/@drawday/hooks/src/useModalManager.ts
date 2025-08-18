/**
 * Modal Management Hook
 *
 * Centralized modal state management with performance optimizations.
 * Prevents unnecessary re-renders and provides stable handler references.
 *
 * Performance features:
 * - Batched state updates
 * - Stable callback references
 * - Optimized for multiple modal coordination
 */

import { useState, useCallback } from 'react';

export interface ModalState {
  showNameModal: boolean;
  showMapperModal: boolean;
  showDuplicateModal: boolean;
  showConversionModal: boolean;
  showDeleteDialog: boolean;
}

export interface ModalActions {
  setShowNameModal: (show: boolean) => void;
  setShowMapperModal: (show: boolean) => void;
  setShowDuplicateModal: (show: boolean) => void;
  setShowConversionModal: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  closeAllModals: () => void;
}

const initialState: ModalState = {
  showNameModal: false,
  showMapperModal: false,
  showDuplicateModal: false,
  showConversionModal: false,
  showDeleteDialog: false,
};

export function useModalManager(): ModalState & ModalActions {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  // Stable callback references using useCallback
  const setShowNameModal = useCallback((show: boolean) => {
    setModalState(prev => ({ ...prev, showNameModal: show }));
  }, []);

  const setShowMapperModal = useCallback((show: boolean) => {
    setModalState(prev => ({ ...prev, showMapperModal: show }));
  }, []);

  const setShowDuplicateModal = useCallback((show: boolean) => {
    setModalState(prev => ({ ...prev, showDuplicateModal: show }));
  }, []);

  const setShowConversionModal = useCallback((show: boolean) => {
    setModalState(prev => ({ ...prev, showConversionModal: show }));
  }, []);

  const setShowDeleteDialog = useCallback((show: boolean) => {
    setModalState(prev => ({ ...prev, showDeleteDialog: show }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState(initialState);
  }, []);

  return {
    ...modalState,
    setShowNameModal,
    setShowMapperModal,
    setShowDuplicateModal,
    setShowConversionModal,
    setShowDeleteDialog,
    closeAllModals,
  };
}