const async = require('async');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Author = require('../models/author');
const Genre = require('../models/genre');

exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (callback) => Book.countDocuments({}, callback),
      book_instance_count: (callback) =>
        BookInstance.countDocuments({}, callback),
      book_instance_available_count: (callback) =>
        BookInstance.countDocuments({ status: 'Available' }, callback),
      author_count: (callback) => Author.countDocuments({}, callback),
      genre_count: (callback) => Genre.countDocuments({}, callback),
    },
    (err, results) =>
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results,
      })
  );
};

// Display list of all Books.
exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, list_books) => {
      if (err) {
        return next(err);
      }
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific Book.
exports.book_detail = (req, res, next) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback),
      book_instances: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book == null) {
        const err = new Error('Book not found');
        err.status = 404;
        return next(err);
      }
      res.render('book_detail', { title: 'Book Detail', ...results });
    }
  );
};

// Display Book create form on GET.
exports.book_create_get = (req, res, next) => {
  async.parallel(
    {
      authors: (callback) => Author.find(callback),
      genres: (callback) => Genre.find(callback),
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      res.render('book_form', { title: 'Create Book', ...results });
    }
  );
};

// Display Book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render again when error
      async.parallel(
        {
          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) return next(err);
          for (let i = 0; i < results.genres.length; i++) {
            if (req.body.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Create Book',
            book: req.body,
            ...results,
            errors: errors.array(),
          });
        }
      );
    } else {
      const book = new Book(req.body);
      book.save((err) => {
        if (err) return next(err);
        res.redirect(book.url);
      });
    }
  },
];

// Display Book update form on GET
exports.book_update_get = (req, res, next) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback),
      authors: (callback) => Author.find(callback),
      genres: (callback) => Genre.find(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book == null) {
        const error = new Error('Book not found');
        error.status = 404;
        return next(error);
      }
      // Success
      results.book.genre.forEach((element) => {
        results.genres.forEach((genre) => {
          if (genre._id.toString() === element._id.toString()) {
            genre.checked = 'true';
          }
        });
      });
      res.render('book_form', { title: 'Update Book', ...results });
    }
  );
};

// Display Book update on POST
exports.book_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }),

  // Process request
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render again when error
      async.parallel(
        {
          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) return next(err);
          for (let i = 0; i < results.genres.length; i++) {
            if (req.body.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Create author',
            book: req.body,
            ...results,
            errors: errors.array(),
          });
        }
      );
    } else {
      // assign the old id, to avoid a new assigned ID
      const book = new Book({ _id: req.params.id, ...req.body });
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, theBook) => {
        if (err) {
          next(err);
          return;
        }
        // Success update
        res.redirect(theBook.url);
      });
    }
  },
];

// Display Book delete form on GET.
exports.book_delete_get = (req, res, next) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback),
      book_instances: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book == null) {
        return res.redirect('/catalog/books');
      }
      res.render('book_delete', { title: 'Delete Book', ...results });
    }
  );
};

// Display Book delete on POST.
exports.book_delete_post = (req, res, next) => {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.body.book_id)
          .populate('author')
          .populate('genre')
          .exec(callback),
      book_instances: (callback) =>
        BookInstance.find({ book: req.body.book_id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      // Book not found
      if (results.book == null) {
        return res.redirect('/catalog/books');
      }
      // Book has copies. Render in the same way as for GET route.
      if (results.book_instances.length > 0) {
        return res.render('book_delete', { title: 'Delete Book', ...results });
      }
      // Delete book and redirect to the list of books.
      Book.findByIdAndDelete(req.body.book_id, (err) => {
        if (err) return next(err);
        res.redirect('/catalog/books');
      });
    }
  );
};
