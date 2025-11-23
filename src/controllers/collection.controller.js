import * as supabaseService from '../services/supabaseService.js';

export const list = async (req, res, next) => {
  try {
    const data = await supabaseService.listItems(
      req.accessToken,
      'collections',
      '*',
      (q) => q
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await supabaseService.insertItem(
      req.accessToken,
      'collections',
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
      'collections',
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
      'collections',
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
