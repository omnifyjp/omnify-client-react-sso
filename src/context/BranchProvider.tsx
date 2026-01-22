'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BranchContext } from './BranchContext';
import { useSsoContext } from './SsoContext';
import { createBranchService, type BranchesResponse } from '../services/branchService';
import { ssoQueryKeys } from '../queryKeys';
import type { BranchProviderProps, SsoBranch, BranchContextValue } from '../types';

const DEFAULT_STORAGE_KEY = 'omnify_selected_branch';

/**
 * BranchProvider component
 * 
 * Provides branch state management for the application.
 * Automatically fetches branches when organization changes.
 * 
 * @example
 * ```tsx
 * // In your app
 * <SsoProvider config={ssoConfig}>
 *   <BranchProvider>
 *     <App />
 *   </BranchProvider>
 * </SsoProvider>
 * 
 * // In a component
 * function MyComponent() {
 *   const { branches, currentBranch, switchBranch } = useBranch();
 *   // ...
 * }
 * ```
 */
export function BranchProvider({
    children,
    storage = 'localStorage',
    storageKey = DEFAULT_STORAGE_KEY,
    onBranchChange,
}: BranchProviderProps) {
    const { config, currentOrg, isAuthenticated } = useSsoContext();
    const queryClient = useQueryClient();

    const branchService = useMemo(
        () => createBranchService({ apiUrl: config.apiUrl }),
        [config.apiUrl]
    );

    // Get saved branch ID from storage
    const getSavedBranchId = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        const saved = storageObj.getItem(`${storageKey}_${currentOrg?.slug}`);
        return saved ? parseInt(saved, 10) : null;
    }, [storage, storageKey, currentOrg?.slug]);

    // Save branch ID to storage
    const saveBranchId = useCallback((branchId: number | null) => {
        if (typeof window === 'undefined' || !currentOrg?.slug) return;
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        if (branchId) {
            storageObj.setItem(`${storageKey}_${currentOrg.slug}`, String(branchId));
        } else {
            storageObj.removeItem(`${storageKey}_${currentOrg.slug}`);
        }
    }, [storage, storageKey, currentOrg?.slug]);

    // Selected branch state
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => getSavedBranchId());

    // Fetch branches for current organization
    const {
        data: branchesData,
        isLoading,
        error,
        refetch,
    } = useQuery<BranchesResponse>({
        queryKey: ssoQueryKeys.branches.list(currentOrg?.slug),
        queryFn: () => branchService.list(currentOrg?.slug),
        enabled: isAuthenticated && !!currentOrg,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Extract branches data
    const branches = branchesData?.branches ?? [];
    const allBranchesAccess = branchesData?.all_branches_access ?? false;
    const primaryBranchId = branchesData?.primary_branch_id ?? null;
    const hasMultipleBranches = branches.length > 1;

    // Find current branch from branches list
    const currentBranch = useMemo((): SsoBranch | null => {
        if (!branches.length) return null;

        // If only one branch, auto-select it
        if (branches.length === 1) {
            return branches[0];
        }

        // If we have a saved selection, use it
        if (selectedBranchId) {
            const found = branches.find(b => b.id === selectedBranchId);
            if (found) return found;
        }

        // Use primary branch if available
        if (primaryBranchId) {
            const primary = branches.find(b => b.id === primaryBranchId);
            if (primary) return primary;
        }

        // Use headquarters
        const hq = branches.find(b => b.is_headquarters);
        if (hq) return hq;

        // Fallback to first branch
        return branches[0];
    }, [branches, selectedBranchId, primaryBranchId]);

    // Update selected branch ID when current branch changes
    useEffect(() => {
        if (currentBranch && currentBranch.id !== selectedBranchId) {
            setSelectedBranchId(currentBranch.id);
            saveBranchId(currentBranch.id);
            onBranchChange?.(currentBranch);
        }
    }, [currentBranch, selectedBranchId, saveBranchId, onBranchChange]);

    // Reset selection when organization changes
    useEffect(() => {
        const savedId = getSavedBranchId();
        setSelectedBranchId(savedId);
    }, [currentOrg?.slug, getSavedBranchId]);

    // Switch branch function
    const switchBranch = useCallback((branchId: number) => {
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
            setSelectedBranchId(branchId);
            saveBranchId(branchId);
            onBranchChange?.(branch);
        }
    }, [branches, saveBranchId, onBranchChange]);

    // Refresh branches
    const refreshBranches = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ssoQueryKeys.branches.list(currentOrg?.slug),
        });
        await refetch();
    }, [queryClient, currentOrg?.slug, refetch]);

    const contextValue: BranchContextValue = useMemo(
        () => ({
            branches,
            currentBranch,
            allBranchesAccess,
            primaryBranchId,
            isLoading,
            error: error as Error | null,
            hasMultipleBranches,
            switchBranch,
            refreshBranches,
        }),
        [
            branches,
            currentBranch,
            allBranchesAccess,
            primaryBranchId,
            isLoading,
            error,
            hasMultipleBranches,
            switchBranch,
            refreshBranches,
        ]
    );

    return (
        <BranchContext.Provider value={contextValue}>
            {children}
        </BranchContext.Provider>
    );
}
