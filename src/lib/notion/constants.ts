/**
 * Notion database IDs for the NOLA Music Tracker workspace.
 * Source of truth: notion.so → NOLA Music Tracker → Claude Agent Instructions
 */
export const DATABASE_IDS = {
  EVENTS: '10a698eb-000e-4b66-943a-c85a776b0763',
  VENUES: '90a8f27f-15f2-4f7b-b32f-501e8f7cd05f',
  ACTS: '8b738c1d-e6f7-4d66-bee8-c1afb566ab4d',
  /** Suspended as of 2026-04-10. Field retained in Events schema but not populated. */
  ORGANIZATIONS: '01ba2d4e-1b0c-4227-a7fd-d8f8ba4782bc',
  RESOURCES: '52095a16-2d6a-4d31-89ba-752bf1be9a40',
} as const;
