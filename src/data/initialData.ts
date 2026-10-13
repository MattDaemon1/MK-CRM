import { CrmDatabase, DEFAULT_SERVICE_TYPES } from '../types/crm';

export const INITIAL_DATABASE: CrmDatabase = {
  version: 4,
  last_updated: '1970-01-01T00:00:00.000Z',
  prospects: [],
  tickets: [],
  tasks: [],
  custom_service_types: DEFAULT_SERVICE_TYPES
};
