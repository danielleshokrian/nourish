import api from './api';

class EntryService {
  async createEntry(entryData) {
    return api.post('/entries', entryData);
  }

  async getEntriesByDate(date) {
    return api.get('/entries', { date });
  }

  async updateEntry(entryId, data) {
    return api.put(`/entries/${entryId}`, data);
  }

  async deleteEntry(entryId) {
    return api.delete(`/entries/${entryId}`);
  }

  async getDailySummary(date) {
    return api.get(`/summary/${date}`);
  }

  async getWeeklySummary(startDate) {
    return api.get(`/summary/week/${startDate}`);
  }
}

export default new EntryService();