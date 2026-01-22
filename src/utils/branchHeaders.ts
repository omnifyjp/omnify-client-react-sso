/**
 * Branch header utilities for API clients
 *
 * These utilities help set branch context headers on axios instances.
 * Works with BranchGate's onSelectionChange callback.
 *
 * @example
 * ```typescript
 * import { createBranchHeaderSetter } from '@famgia/omnify-react-sso';
 * import api from './api'; // your axios instance
 *
 * // Create setter for your axios instance
 * const setBranchHeaders = createBranchHeaderSetter(api);
 *
 * // Use in BranchGate
 * <BranchGate onSelectionChange={setBranchHeaders}>
 *   <App />
 * </BranchGate>
 * ```
 */

import type { BranchGateSelection } from '../types';

/**
 * Headers set by branch selection
 */
export const BRANCH_HEADERS = {
  BRANCH_ID: 'X-Branch-Id',
  ORG_ID: 'X-Org-Id',
  BRANCH_NAME: 'X-Branch-Name',
  BRANCH_CODE: 'X-Branch-Code',
} as const;

/**
 * Minimal axios-like interface for header management
 */
interface AxiosLike {
  defaults: {
    headers: {
      common: Record<string, string | undefined>;
    };
  };
}

/**
 * Create a branch header setter function for an axios instance
 *
 * @param axiosInstance - Your axios instance
 * @returns A function to pass to BranchGate's onSelectionChange
 *
 * @example
 * ```typescript
 * const setBranchHeaders = createBranchHeaderSetter(api);
 *
 * <BranchGate onSelectionChange={setBranchHeaders}>
 *   <App />
 * </BranchGate>
 * ```
 */
export function createBranchHeaderSetter(axiosInstance: AxiosLike) {
  return (selection: BranchGateSelection | null) => {
    if (selection) {
      axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_ID] = selection.branchId;
      axiosInstance.defaults.headers.common[BRANCH_HEADERS.ORG_ID] = selection.orgId;
      if (selection.branchName) {
        axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_NAME] = selection.branchName;
      }
      if (selection.branchCode) {
        axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_CODE] = selection.branchCode;
      }
    } else {
      delete axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_ID];
      delete axiosInstance.defaults.headers.common[BRANCH_HEADERS.ORG_ID];
      delete axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_NAME];
      delete axiosInstance.defaults.headers.common[BRANCH_HEADERS.BRANCH_CODE];
    }
  };
}

/**
 * Set branch headers directly on an axios instance
 *
 * @example
 * ```typescript
 * import api from './api';
 * import { setBranchHeaders } from '@famgia/omnify-react-sso';
 *
 * // In BranchGate onSelectionChange
 * <BranchGate onSelectionChange={(s) => setBranchHeaders(api, s)}>
 *   <App />
 * </BranchGate>
 * ```
 */
export function setBranchHeaders(
  axiosInstance: AxiosLike,
  selection: BranchGateSelection | null
): void {
  createBranchHeaderSetter(axiosInstance)(selection);
}
