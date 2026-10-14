import type { Job } from "../hooks/useLiveJobs";
import { isEvidence, parseJobDetails } from "./parseJobDetails";
import type { Evidence } from "./jobDetails";

export const screeningEnabled = () => process.env.NEXT_PUBLIC_SCREENING_ENABLED === "true";
export type ScreeningBucket = "matches" | "review" | "excluded";
export interface ScreeningResult { bucket: ScreeningBucket; reasons: string[] }
export interface Requirements {
  authorization: "cpt" | "opt" | "stem_opt" | "unrestricted" | null;
  future_sponsorship: boolean;
  locations: string[];
  internship_hourly: string | number | null;
  new_grad_annual: string | number | null;
  currency: "USD";
}
export const defaultRequirements: Requirements = { authorization: null, future_sponsorship: false,
  locations: [], internship_hourly: null, new_grad_annual: null, currency: "USD" };
export interface ProfileResponse { configured: boolean; requirements: Requirements; revision: number }
export interface EvidenceResponse {
  job_id: number; status: string; fresh: boolean; verified_at: string | null; checked_at: string | null;
  screening?: ScreeningResult;
  details: unknown;
  documents: { id: number; final_url: string; kind: string; facts: unknown }[];
}
export interface ScreenedPage {
  items: Job[]; total: number; counts: Record<ScreeningBucket, number>;
  page: number; total_pages: number; profile_configured: boolean;
}
const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export const restrictionNames = { citizenship_required: "Citizenship restriction", permanent_authorization_required: "Permanent work-authorization restriction" };
interface RestrictionFact { value: "required" | "conditional" | "conflicting"; evidence: Evidence[] }
export function parseRestrictions(value: unknown): Partial<Record<keyof typeof restrictionNames, RestrictionFact>> {
  const result: Partial<Record<keyof typeof restrictionNames, RestrictionFact>> = {};
  if (!object(value) || !object(value.restrictions)) return result;
  for (const [key, fact] of Object.entries(value.restrictions)) {
    if (!Object.hasOwn(restrictionNames, key) || !object(fact) || !["required", "conditional", "conflicting"].includes(String(fact.value))
      || !Array.isArray(fact.evidence) || fact.evidence.length === 0 || fact.evidence.length > 10 || !fact.evidence.every(isEvidence)) continue;
    result[key as keyof typeof restrictionNames] = fact as unknown as RestrictionFact;
  }
  return result;
}
export function parseScreening(value: unknown): ScreeningResult | undefined {
  if (!object(value) || !["matches", "review", "excluded"].includes(String(value.bucket)) || !Array.isArray(value.reasons)
    || value.reasons.length > 20 || !value.reasons.every(item => typeof item === "string" && item.length <= 500)) return undefined;
  return { bucket: value.bucket as ScreeningBucket, reasons: value.reasons as string[] };
}
export function parseScreenedPage(value: unknown): ScreenedPage {
  if (!object(value) || !Array.isArray(value.items) || typeof value.total !== "number" || !object(value.counts)
    || typeof value.page !== "number" || typeof value.total_pages !== "number") throw new Error("Could not read screened jobs.");
  const counts = value.counts;
  if (!["matches", "review", "excluded"].every(key => typeof counts[key] === "number" && Number.isSafeInteger(counts[key]) && Number(counts[key]) >= 0)) throw new Error("Could not read screened job counts.");
  const items = value.items.map(item => {
    if (!object(item) || !object(item.company) || typeof item.id !== "number" || typeof item.title !== "string"
      || typeof item.company.name !== "string" || typeof item.location !== "string" || typeof item.apply_url !== "string"
      || typeof item.created_at !== "string" || !parseScreening(item.screening)) throw new Error("Could not read screened job details.");
    return { id: item.id, title: item.title, company: item.company.name, location: item.location,
      apply_url: item.apply_url, discovered_at: item.created_at, posted_at: typeof item.posted_at === "string" ? item.posted_at : undefined,
      role_type: String(item.job_type), is_closed: item.is_closed === true,
      details: parseJobDetails(item.details), screening: parseScreening(item.screening) } satisfies Job;
  });
  return { items, total: value.total, counts: counts as Record<ScreeningBucket, number>, page: value.page,
    total_pages: value.total_pages, profile_configured: value.profile_configured === true };
}
export const bucketLabels: Record<ScreeningBucket, string> = { matches: "Matches", review: "Needs review", excluded: "Does not meet requirements" };
