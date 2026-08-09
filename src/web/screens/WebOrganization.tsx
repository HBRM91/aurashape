import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createOrganization, listOrganizations, type OrganizationMembership } from '@/src/lib/organizations';
import { isLocalOnly } from '@/src/lib/privacyMode';
import { useIsDark } from '@/src/stores/theme';
import { WebButton } from '../WebButton';
import { WebCard } from '../WebCard';
import { getWebTokens, WEB_TOKENS } from '../tokens';

export function WebOrganization() {
  const tokens = getWebTokens(useIsDark());
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(!isLocalOnly());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      setOrganizations(await listOrganizations());
    } catch {
      setError('We could not load your organizations. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadOrganizations(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const created = await createOrganization(name, slug);
      setOrganizations((current) => [...current, { ...created, role: 'owner' }]);
      setName('');
      setSlug('');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'We could not create the organization.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page} style={{ backgroundColor: tokens.colors.page }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>Organizations</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>Manage private wellness spaces without exposing individual health records.</Text>
      </View>

      {isLocalOnly() ? (
        <WebCard>
          <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Cloud mode is off</Text>
          <Text style={[styles.body, { color: tokens.colors.textMuted }]}>Organizations are available when a production Supabase connection is explicitly enabled. Your local data remains on this device.</Text>
        </WebCard>
      ) : (
        <>
          <WebCard>
            <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Your organizations</Text>
            {loading ? <Text style={[styles.body, { color: tokens.colors.textMuted }]}>Loading organizations...</Text> : null}
            {!loading && organizations.length === 0 ? <Text style={[styles.body, { color: tokens.colors.textMuted }]}>You do not belong to an organization yet.</Text> : null}
            {organizations.map((organization) => (
              <View key={organization.id} style={[styles.organization, { borderBottomColor: tokens.colors.border }]}>
                <View style={styles.organizationCopy}>
                  <Text style={[styles.organizationName, { color: tokens.colors.text }]}>{organization.name}</Text>
                  <Text style={[styles.body, { color: tokens.colors.textMuted }]}>{organization.slug} · {organization.role}</Text>
                </View>
                <Text style={[styles.role, { color: tokens.colors.primary }]}>{organization.role}</Text>
              </View>
            ))}
          </WebCard>

          <WebCard>
            <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Create an organization</Text>
            <Text style={[styles.body, { color: tokens.colors.textMuted }]}>You become the owner. Employer reporting is aggregate-only and stays hidden for groups under 10 members.</Text>
            <TextInput accessibilityLabel="Organization name" placeholder="Organization name" placeholderTextColor={tokens.colors.textMuted} value={name} onChangeText={setName} style={[styles.input, { borderColor: tokens.colors.border, color: tokens.colors.text }]} />
            <TextInput accessibilityLabel="Organization slug" autoCapitalize="none" placeholder="organization-slug" placeholderTextColor={tokens.colors.textMuted} value={slug} onChangeText={setSlug} style={[styles.input, { borderColor: tokens.colors.border, color: tokens.colors.text }]} />
            <WebButton label={saving ? 'Creating...' : 'Create organization'} disabled={saving} onPress={() => void handleCreate()} />
          </WebCard>
        </>
      )}

      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: tokens.colors.primaryStrong }]}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: WEB_TOKENS.spacing.lg, padding: WEB_TOKENS.spacing.xl, paddingBottom: WEB_TOKENS.spacing.xxl },
  header: { gap: WEB_TOKENS.spacing.xs, marginBottom: WEB_TOKENS.spacing.sm },
  title: { ...WEB_TOKENS.typography.display, fontSize: 30, fontWeight: '800' },
  subtitle: { ...WEB_TOKENS.typography.body, maxWidth: 680 },
  cardTitle: { ...WEB_TOKENS.typography.heading, marginBottom: WEB_TOKENS.spacing.sm },
  body: { ...WEB_TOKENS.typography.body, lineHeight: 22 },
  organization: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: WEB_TOKENS.spacing.md },
  organizationCopy: { flex: 1 },
  organizationName: { ...WEB_TOKENS.typography.label, fontSize: 16 },
  role: { ...WEB_TOKENS.typography.label, textTransform: 'capitalize' },
  input: { borderRadius: WEB_TOKENS.radii.sm, borderWidth: 1, fontSize: 16, marginBottom: WEB_TOKENS.spacing.sm, minHeight: 48, paddingHorizontal: WEB_TOKENS.spacing.md },
  error: { ...WEB_TOKENS.typography.body, fontWeight: '600' },
});
