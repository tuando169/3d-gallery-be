import * as supabaseService from '../services/supabaseService.js';

export const list = async (req, res, next) => {
  try {
    const data = await supabaseService.listItems(
      req.accessToken,
      'users',
      '*',
      (q) => q
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
export const getOne = async (req, res, next) => {
  try {
    const data = await supabaseService.getById(
      req.accessToken, // token để áp dụng RLS
      'users', // bảng
      req.params.id // id từ URL param
    );

    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};
export const create = async (req, res, next) => {
  try {
    const data = await supabaseService.insertItem(
      req.accessToken,
      'users',
      req.body
    );
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await supabaseService.updateById(
      req.accessToken,
      'users',
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await supabaseService.deleteById(
      req.accessToken,
      'users',
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
