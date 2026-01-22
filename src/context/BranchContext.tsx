'use client';

import { createContext, useContext } from 'react';
import type { BranchContextValue } from '../types';

/**
 * Branch Context
 * 
 * Provides branch state management across the application.
 * Must be used within a BranchProvider.
 */
export const BranchContext = createContext<BranchContextValue | null>(null);

/**
 * Hook to access Branch context
 * @throws Error if used outside BranchProvider
 */
export function useBranchContext(): BranchContextValue {
    const context = useContext(BranchContext);

    if (!context) {
        throw new Error('useBranchContext must be used within a BranchProvider');
    }

    return context;
}
