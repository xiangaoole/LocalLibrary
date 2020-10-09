const async = require('async');
const { body, validationResult } = require('express-validator');
const { populate } = require('../models/author');
const Author = require('../models/author');
const Book = require('../models/book');

// Display list of all Authors.
exports.author_list = (req, res, next) => {
  Author.find()
    .populate('author')
    .sort([['family_name', 'asc']])
    .exec((err, list_authors) => {
      if (err) {
        next(err);
        return;
      }
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors,
      });
    });
};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      if (results.author == null) {
        const err = new Error('Author not found');
        err.status = 404;
        next(err);
        return;
      }
      res.render('author_detail', { title: 'Author Detail', ...results });
    }
  );
};

// Display Author create form on GET.
exports.author_create_get = (req, res) =>
  res.render('author_form', { title: 'Create Author' });

// Display Author create on POST.
exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ max: 100, min: 1 })
    .withMessage('First name length must be in the range of 1~100')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ max: 100, min: 1 })
    .withMessage('Family name length must be in the range of 1~100')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death').optional({ checkFalsy: true }).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create author',
        author: { ...req.body },
        errors: errors.array(),
      });
      return;
    }

    const author = new Author({ ...req.body });
    author.save((err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(author.url);
    });
  },
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      if (results.author == null) {
        res.redirect('/catalog/authors');
        return;
      }
      res.render('author_delete', { title: 'Delete Author', ...results });
    }
  );
};

// Display Author delete on POST.
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => Author.findById(req.body.author_id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.body.author_id }).exec(callback),
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      // Author has books. Render in the same way as for GET route.
      if (results.author_books.length > 0) {
        res.render('author_delete', {
          title: 'Delete Author',
          ...results,
        });
        return;
      }
      // Author has no books. Delete author and redirect to the list of authors.
      Author.findByIdAndDelete(req.body.author_id, (err) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect('/catalog/authors');
      });
    }
  );
};

// Display Author update form on GET
exports.author_update_get = (req, res, next) => {
  Author.findById(req.params.id).exec((err, result) => {
    if (err) {
      next(err);
      return;
    }
    res.render('author_form', { title: 'Update Author', author: result });
  });
};

// Display Author update on POST
exports.author_update_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ max: 100, min: 1 })
    .withMessage('First name length must be in the range of 1~100')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ max: 100, min: 1 })
    .withMessage('Family name length must be in the range of 1~100')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create author',
        author: { ...req.body },
        errors: errors.array(),
      });
      return;
    }
    // assign the old id, to avoid a new assigned ID
    const author = new Author({ _id: req.params.id, ...req.body });
    Author.findByIdAndUpdate(req.params.id, author, {}, (err, theAuthor) => {
      if (err) {
        next(err);
        return;
      }
      // Success update
      res.redirect(theAuthor.url);
    });
  },
];
