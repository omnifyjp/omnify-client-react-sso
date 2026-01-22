'use client';

import { useBranchContext } from '../context/BranchContext';
import type { BranchContextValue } from '../types';

/**
 * Hook return type for branch management
 */
export type UseBranchReturn = BranchContextValue;

/**
 * Hook for branch management
 * 
 * Provides access to branch state and operations.
 * Must be used within a BranchProvider.
 * 
 * @example
 * ```tsx
 * function BranchInfo() {
 *   const { 
 *     branches, 
 *     currentBranch, 
 *     hasMultipleBranches,
 *     switchBranch 
 *   } = useBranch();
 * 
 *   // Auto-selection logic is handled by the provider
 *   // - If only 1 branch: auto-selected
 *   // - If multiple: use saved preference or primary branch
 * 
 *   return (
 *     <div>
 *       <p>Current: {currentBranch?.name}</p>
 *       {hasMultipleBranches && (
 *         <select onChange={(e) => switchBranch(Number(e.target.value))}>
 *           {branches.map((branch) => (
 *             <option key={branch.id} value={branch.id}>
 *               {branch.name}
 *             </option>
 *           ))}
 *         </select>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBranch(): UseBranchReturn {
    return useBranchContext();
}
