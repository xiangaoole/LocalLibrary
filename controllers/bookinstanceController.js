const { body, validationResult } = require('express-validator');
const async = require('async');
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstance) => {
      if (err) {
        return next(err);
      }

      list_bookinstance.sort((a, b) => {
        const textA = a.book.title.toUpperCase();
        const textB = b.book.title.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstance,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, result) => {
      if (err) return next(err);
      res.render('bookinstance_detail', {
        title: 'Copy detail',
        bookinstance: result,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, 'title').exec((err, books) => {
    if (err) {
      next(err);
      return;
    }
    res.render('bookinstance_form', { title: 'Create BookInstance', books });
  });
};

// Display BookInstance create on POST.
exports.bookinstance_create_post = [
  body('imprint', 'Imprint must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('due_back').optional({ checkFalsy: true }).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render again when error
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          next(err);
          return;
        }
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_instance: req.body,
          books,
          errors: errors.array(),
        });
      });
    } else {
      const bookInstance = new BookInstance(req.body);
      bookInstance.save((err) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect(bookInstance.url);
      });
    }
  },
];

// Display BookInstance update form on GET
exports.bookinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      book_instance: (callback) =>
        BookInstance.findById(req.params.id).populate('book').exec(callback),
      books: (callback) => Book.find({}, 'title').exec(callback),
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        ...results,
      });
    }
  );
};

// Display BookInstance update on POST
exports.bookinstance_update_post = [
  // Validate and sanitize request field.
  body('imprint', 'Imprint must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('due_back').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render again when error
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          next(err);
          return;
        }
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_instance: req.body,
          books,
          errors: errors.array(),
        });
      });
    } else {
      // assign the old id, to avoid a new assigned ID
      const bookInstance = new BookInstance({
        _id: req.params.id,
        ...req.body,
      });
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {},
        (err, theBookInstance) => {
          if (err) {
            next(err);
            return;
          }
          // Success update
          res.redirect(theBookInstance.url);
        }
      );
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, result) => {
      if (err) return next(err);
      res.render('bookinstance_delete', {
        title: 'Delete Copy',
        bookinstance: result,
      });
    });
};

// Display BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  BookInstance.findByIdAndDelete(req.body.bookinstance_id, (err) => {
    if (err) return next(err);
    res.redirect('/catalog/bookinstances');
  });
};
