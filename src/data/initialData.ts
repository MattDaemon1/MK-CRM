import { CrmDatabase, DEFAULT_SERVICE_TYPES } from '../types/crm';

export const INITIAL_DATABASE: CrmDatabase = {
  version: 2,
  last_updated: new Date().toISOString(),
  prospects: [],
  tickets: [],
  tasks: [],
  custom_service_types: DEFAULT_SERVICE_TYPES
};
