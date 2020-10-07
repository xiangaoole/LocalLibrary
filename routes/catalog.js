const express = require('express');

const router = express.Router();

const book_controller = require('../controllers/bookController');
const bookinstance_controller = require('../controllers/bookinstanceController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');

/// BOOK ROUTES ///
router.get('/', book_controller.index);
router.get('/book/create', book_controller.book_create_get);
router.post('/book/create', book_controller.book_create_post);
router.get('/book/:id/delete', book_controller.book_delete_get);
router.post('/book/:id/delete', book_controller.book_delete_post);
router.get('/book/:id/update', book_controller.book_update_get);
router.post('/book/:id/update', book_controller.book_update_post);
router.get('/books/', book_controller.book_list);
router.get('/book/:id', book_controller.book_detail);

/// AUTHOR ROUTES ///
router.get('/author/create', author_controller.author_create_get);
router.post('/author/create', author_controller.author_create_post);
router.get('/author/:id/delete', author_controller.author_delete_get);
router.post('/author/:id/delete', author_controller.author_delete_post);
router.get('/author/:id/update', author_controller.author_update_get);
router.post('/author/:id/update', author_controller.author_update_post);
router.get('/authors/', author_controller.author_list);
router.get('/author/:id', author_controller.author_detail);

/// GENRE ROUTES ///
router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);
router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);
router.get('/genres/', genre_controller.genre_list);
router.get('/genre/:id', genre_controller.genre_detail);

/// BOOKINSTANCE ROUTES ///
router.get(
  '/bookinstance/create',
  bookinstance_controller.bookinstance_create_get
);
router.post(
  '/bookinstance/create',
  bookinstance_controller.bookinstance_create_post
);
router.get(
  '/bookinstance/:id/delete',
  bookinstance_controller.bookinstance_delete_get
);
router.post(
  '/bookinstance/:id/delete',
  bookinstance_controller.bookinstance_delete_post
);
router.get(
  '/bookinstance/:id/update',
  bookinstance_controller.bookinstance_update_get
);
router.post(
  '/bookinstance/:id/update',
  bookinstance_controller.bookinstance_update_post
);
router.get('/bookinstances/', bookinstance_controller.bookinstance_list);
router.get('/bookinstance/:id', bookinstance_controller.bookinstance_detail);

module.exports = router;
