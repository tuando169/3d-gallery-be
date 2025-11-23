import { supabaseService } from './supabaseService';

const TABLE = 'magazines';

export const NewsService = {
  async list(token: string) {
    return await supabaseService.findAllAdmin( TABLE, '*', (q: any) => q);
  },

  async create(token: string, body: any) {
    return await supabaseService.create(token, TABLE, body);
  },

  async update(token: string, id: string, body: any) {
    return await supabaseService.updateById(token, TABLE, id, body);
  },

  async remove(token: string, id: string) {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
