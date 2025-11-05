import { Router } from 'express';
import auth from './auth.route.js';
import user from './user.route.js';
import room from './room.route.js';
import roomCollaborator from './room-collaborator.route.js';
import media from './media.route.js';
import object3d from './object3d.route.js';
import texture from './texture.route.js';
import collection from './collection.route.js';
import collectionItem from './collection-item.route.js';
import magazine from './magazine.route.js';
import magazineItem from './magazine-item.route.js';

const router = Router();

router.use('/', auth);
router.use('/user', user);
router.use('/room', room);
router.use('/room-collaborator', roomCollaborator);
router.use('/media', media);
router.use('/object3d', object3d);
router.use('/texture', texture);
router.use('/collection', collection);
router.use('/collection-item', collectionItem);
router.use('/magazine', magazine);
router.use('/magazine-item', magazineItem);

export default router;
