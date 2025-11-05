import * as supabaseService from '../services/supabaseService.js';

export const list = async (req, res, next) => {
  try {
    const data = await supabaseService.listItems(
      req.accessToken,
      'magazines',
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
      'magazines',
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
      'magazines',
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
      'magazines',
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
