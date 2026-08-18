import { AuditResult } from "../audit";
import { getProjectInfo } from "./framerService";

const STORAGE_PREFIX = "template_checker_";
const STORAGE_KEY_SUFFIX = "_audit_result";

/**
 * Interface for stored audit data
 */
export interface StoredAuditData {
  result: AuditResult;
  timestamp: string;
  projectId: string;
  projectName: string;
}

/**
 * Get storage key for current project
 */
async function getProjectStorageKey(): Promise<string> {
  try {
    const projectInfo = await getProjectInfo();
    return `${STORAGE_PREFIX}${projectInfo.id}${STORAGE_KEY_SUFFIX}`;
  } catch (error) {
    // Error handled
    // Fallback to a generic key if project info is unavailable
    return `${STORAGE_PREFIX}default${STORAGE_KEY_SUFFIX}`;
  }
}

/**
 * Save audit result to localStorage for current project
 */
export async function saveAuditResult(result: AuditResult): Promise<void> {
  try {
    const projectInfo = await getProjectInfo();
    const storageKey = await getProjectStorageKey();
    
    const dataToStore: StoredAuditData = {
      result,
      timestamp: new Date().toISOString(),
      projectId: projectInfo.id,
      projectName: projectInfo.name,
    };

    localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    // Log handled
  } catch (error) {
    // Error handled
    // Don't throw error - storage is optional
  }
}

/**
 * Load audit result from localStorage for current project
 */
export async function loadAuditResult(): Promise<StoredAuditData | null> {
  try {
    const storageKey = await getProjectStorageKey();
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      // Log handled
      return null;
    }

    const parsedData: StoredAuditData = JSON.parse(storedData);
    
    // Convert timestamp string back to Date object in result
    if (parsedData.result && parsedData.result.timestamp) {
      parsedData.result.timestamp = new Date(parsedData.result.timestamp);
    }

    // Log handled
    return parsedData;
  } catch (error) {
    // Error handled
    return null;
  }
}

/**
 * Clear audit result from localStorage for current project
 */
export async function clearAuditResult(): Promise<void> {
  try {
    const storageKey = await getProjectStorageKey();
    localStorage.removeItem(storageKey);
    // Log handled
  } catch (error) {
    // Error handled
  }
}

/**
 * Get all stored audit results (for debugging/cleanup)
 */
export function getAllStoredAudits(): Record<string, StoredAuditData> {
  const allAudits: Record<string, StoredAuditData> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key.endsWith(STORAGE_KEY_SUFFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allAudits[key] = JSON.parse(data);
          } catch (e) {
            // Error handled
          }
        }
      }
    }
  } catch (error) {
    // Error handled
  }

  return allAudits;
}

/**
 * Clear all stored audit results (for cleanup)
 */
export function clearAllAuditResults(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key.endsWith(STORAGE_KEY_SUFFIX)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    // Log handled
  } catch (error) {
    // Error handled
  }
}

/**
 * Manual breakpoint verification overrides
 */
const BP_OVERRIDES_SUFFIX = "_bp_overrides";

type BreakpointKind = "mobile" | "tablet";
export interface BreakpointOverrides {
  mobile: boolean;
  tablet: boolean;
}

async function getBreakpointOverridesKey(): Promise<string> {
  try {
    const projectInfo = await getProjectInfo();
    return `${STORAGE_PREFIX}${projectInfo.id}${BP_OVERRIDES_SUFFIX}`;
  } catch (error) {
    return `${STORAGE_PREFIX}default${BP_OVERRIDES_SUFFIX}`;
  }
}

export async function getBreakpointOverrides(): Promise<BreakpointOverrides> {
  try {
    const key = await getBreakpointOverridesKey();
    const raw = localStorage.getItem(key);
    if (!raw) return { mobile: false, tablet: false };
    const parsed = JSON.parse(raw);
    return {
      mobile: !!parsed.mobile,
      tablet: !!parsed.tablet,
    };
  } catch {
    return { mobile: false, tablet: false };
  }
}

export async function setBreakpointOverride(kind: BreakpointKind, value: boolean): Promise<void> {
  try {
    const key = await getBreakpointOverridesKey();
    const current = await getBreakpointOverrides();
    const next = { ...current, [kind]: value } as BreakpointOverrides;
    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    // Error handled
  }
}

