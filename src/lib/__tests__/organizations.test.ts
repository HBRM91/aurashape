import { createOrganization, getEmployerCohortSummary, listOrganizations } from '../organizations';

jest.mock('../privacyMode', () => ({ isLocalOnly: () => true }));

describe('organizations', () => {
  it('returns an empty organization list in local mode', async () => {
    await expect(listOrganizations()).resolves.toEqual([]);
  });

  it('does not create organizations in local mode', async () => {
    await expect(createOrganization('Aurashape Wellness', 'aurashape-wellness')).rejects.toThrow('requires cloud mode');
  });

  it('does not expose employer metrics in local mode', async () => {
    await expect(getEmployerCohortSummary('org-id')).resolves.toBeNull();
  });
});
