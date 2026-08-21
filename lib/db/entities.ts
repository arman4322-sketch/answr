import { db, newId } from "./index";

/* Typed domain records + accessors over the generic document store (./index).
   These are the tables the readiness schema lists; more can be added the same
   way. Every record carries `workspaceId` where it is tenant-scoped, so the
   multi-tenancy story is already threaded through the data model. */

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // scrypt, see lib/auth
  workspaceId: string;
  createdAt: number;
}

export interface Session {
  id: string; // opaque token (the cookie value)
  userId: string;
  workspaceId: string;
  createdAt: number;
  expiresAt: number;
}

export interface TrackedPrompt {
  id: string;
  workspaceId: string;
  text: string;
  intent?: string;
  createdAt: number;
}

export interface ActionItem {
  id: string;
  workspaceId: string;
  title: string;
  impact: string;
  effort: string;
  status: "todo" | "in_progress" | "done";
  createdAt: number;
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  source: string; // "demo" | "snapshot" | "handbook" | "signup" | "waitlist" | ...
  message?: string;
  utmSource?: string; // campaign attribution (utm_source / utm_campaign / referrer)
  utmCampaign?: string;
  referrer?: string;
  createdAt: number;
}

// ---- Leads ----
export async function createLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  const lead: Lead = {
    id: newId("lead"),
    createdAt: Date.now(),
    email: input.email,
    name: input.name,
    company: input.company,
    source: input.source,
    message: input.message,
    utmSource: input.utmSource,
    utmCampaign: input.utmCampaign,
    referrer: input.referrer,
  };
  return db().put("leads", lead);
}
export function listLeads(): Promise<Lead[]> {
  return db().list<Lead>("leads");
}

// ---- Waitlist view events (for funnel / conversion) ----
export interface ViewEvent {
  id: string;
  page: string; // e.g. "waitlist"
  source?: string; // utm_source / referrer bucket
  ts: number;
}
export function recordView(page: string, source?: string): Promise<ViewEvent> {
  return db().put("views", { id: newId("view"), page, source, ts: Date.now() });
}
export function listViews(): Promise<ViewEvent[]> {
  return db().list<ViewEvent>("views");
}

// ---- Prompts (tenant-scoped) ----
export async function addPrompt(workspaceId: string, text: string, intent?: string): Promise<TrackedPrompt> {
  const p: TrackedPrompt = { id: newId("prompt"), workspaceId, text, intent, createdAt: Date.now() };
  return db().put("prompts", p);
}
export async function listPrompts(workspaceId: string): Promise<TrackedPrompt[]> {
  return (await db().list<TrackedPrompt>("prompts")).filter((p) => p.workspaceId === workspaceId);
}

// ---- Actions (tenant-scoped) ----
export async function createAction(
  workspaceId: string,
  input: { title: string; impact: string; effort: string },
): Promise<ActionItem> {
  const a: ActionItem = {
    id: newId("action"),
    workspaceId,
    status: "todo",
    createdAt: Date.now(),
    ...input,
  };
  return db().put("actions", a);
}
export async function listActions(workspaceId: string): Promise<ActionItem[]> {
  return (await db().list<ActionItem>("actions")).filter((a) => a.workspaceId === workspaceId);
}

// ---- Users / sessions (used by lib/auth) ----
export async function findUserByEmail(email: string): Promise<User | null> {
  const norm = email.trim().toLowerCase();
  const users = await db().list<User>("users");
  return users.find((u) => u.email === norm) ?? null;
}
export function putUser(user: User): Promise<User> {
  return db().put("users", user);
}
export function putSession(session: Session): Promise<Session> {
  return db().put("sessions", session);
}
export function getSession(id: string): Promise<Session | null> {
  return db().get<Session>("sessions", id);
}
export function deleteSession(id: string): Promise<void> {
  return db().remove("sessions", id);
}
