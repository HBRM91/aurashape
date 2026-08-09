import { supabase } from './supabase';
import { isLocalOnly } from './privacyMode';

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface OrganizationMembership extends OrganizationSummary {
  role: OrganizationRole;
}

export interface EmployerCohortSummary {
  memberCount: number;
  optedInCount: number;
  activeProgramCount: number;
  generatedAt: string;
}

const namePattern = /^.{2,120}$/s;
const slugPattern = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

function requireName(value: string): string {
  const name = value.trim();
  if (!namePattern.test(name)) throw new Error('Organization name must be between 2 and 120 characters.');
  return name;
}

function requireSlug(value: string): string {
  const slug = value.trim().toLowerCase();
  if (!slugPattern.test(slug)) throw new Error('Organization slug must use lowercase letters, numbers, and hyphens.');
  return slug;
}

export async function listOrganizations(): Promise<OrganizationMembership[]> {
  if (isLocalOnly()) return [];
  const { data, error } = await supabase
    .from('organization_members')
    .select('role, organizations!inner(id, name, slug, created_at)')
    .order('created_at', { referencedTable: 'organizations', ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      createdAt: organization.created_at,
      role: row.role as OrganizationRole,
    };
  });
}

export async function createOrganization(name: string, slug: string): Promise<OrganizationSummary> {
  const validatedName = requireName(name);
  const validatedSlug = requireSlug(slug);
  if (isLocalOnly()) throw new Error('Organization management requires cloud mode.');
  const { data, error } = await supabase.rpc('create_organization', {
    p_name: validatedName,
    p_slug: validatedSlug,
  });
  if (error) throw error;
  return { id: data.id, name: data.name, slug: data.slug, createdAt: data.created_at };
}

export async function getEmployerCohortSummary(organizationId: string): Promise<EmployerCohortSummary | null> {
  if (!organizationId || isLocalOnly()) return null;
  const { data, error } = await supabase.rpc('employer_cohort_summary', { p_org_id: organizationId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || Number(row.member_count) < 10) return null;
  return {
    memberCount: Number(row.member_count),
    optedInCount: Number(row.opted_in_count),
    activeProgramCount: Number(row.active_program_count),
    generatedAt: row.generated_at,
  };
}
