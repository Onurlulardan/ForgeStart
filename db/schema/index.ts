// Barrel re-export for the modular schema.
//
// Each table lives in its own file. To add a new table:
//   1. Create db/schema/<your-table>.ts with the pgTable definition
//   2. Re-export it from this barrel
//   3. If it needs a relations() block, add it to db/schema/relations.ts
//   4. Run `yarn db:generate` to produce a migration

export * from './_shared';

export * from './users';
export * from './accounts';
export * from './sessions';
export * from './verification-tokens';

export * from './resources';
export * from './actions';
export * from './roles';
export * from './permissions';
export * from './permission-actions';
export * from './user-roles';

export * from './organizations';
export * from './organization-members';
export * from './invitations';

export * from './password-reset-tokens';
export * from './email-verification-tokens';

export * from './app-settings';
export * from './api-keys';
export * from './uploads';

export * from './security-logs';
export * from './audit-logs';

export * from './relations';
