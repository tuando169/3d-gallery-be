import { NewsModel } from '../models/newsModel';
import { supabaseService } from './supabaseService';

const TABLE = 'magazines';

export const NewsService = {
  async getAll(token: string): Promise<NewsModel[]> {
    return await supabaseService.findAllAdmin(TABLE, '*', (q: any) => q);
  },

  async create(token: string, body: any): Promise<NewsModel> {
    return await supabaseService.create(token, TABLE, body);
  },

  async update(token: string, id: string, body: any): Promise<NewsModel> {
    return await supabaseService.updateById(token, TABLE, id, body);
  },

  async remove(token: string, id: string): Promise<boolean> {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
