const async = require('async');
const { body } = require('express-validator');
const validator = require('express-validator');
const Book = require('../models/book');
const Genre = require('../models/genre');

// Display list of all Genres.
exports.genre_list = (req, res, next) => {
  Genre.find().exec((err, list_genres) => {
    if (err) next(err);
    res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);
      if (results.genre == null) {
        const err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }
      res.render('genre_detail', { title: 'Genre Detail', ...results });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) =>
  res.render('genre_form', { title: 'Create Genre' });

// Display Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize request body fields
  body('name', 'Genre name at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // process request
  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: req.body,
        errors: errors.array(),
      });
      return;
    }

    const genre = new Genre({ name: req.body.name });

    Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
      if (err) return next(err);
      if (found_genre) res.redirect(found_genre.url);
      else {
        genre.save((err) => {
          if (err) return next(err);
          res.redirect(genre.url);
        });
      }
    });
  },
];

// Display Genre update form on GET
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre) => {
    if (err) {
      next(err);
      return;
    }
    res.render('genre_form', { title: 'Update Genre', genre });
  });
};

// Display Genre update on POST
exports.genre_update_post = [
  // Validate and sanitize request body fields
  body('name', 'Genre name at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // process request
  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: req.body,
        errors: errors.array(),
      });
      return;
    }

    // Save update
    const genre = new Genre({ _id: req.params.id, ...req.body });
    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, theGenre) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(theGenre.url);
    });
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);
      if (results.genre == null) {
        return res.redirect('/catalog/genres');
      }
      res.render('genre_delete', { title: 'Genre Delete', ...results });
    }
  );
};

// Display Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.body.genre_id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.body.genre_id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);
      if (results.genre == null) {
        return res.redirect('/catalog/genres');
      }
      // Genre has book. Render in the same way as for GET route.
      if (results.genre_books.length > 0) {
        return res.render('genre_delete', {
          title: 'Delete Genre',
          ...results,
        });
      }
      // Delete genre and redirect to the list of genres
      Genre.findByIdAndDelete(req.body.genre_id, (err) => {
        if (err) next(err);
        else res.redirect('/catalog/genres');
      });
    }
  );
};
