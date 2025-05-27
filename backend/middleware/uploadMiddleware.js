const multer = require('multer');
const path = require('path');

// Profile image storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Receipt image storage
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Bill image storage
const billStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/bills/');
  },
  filename: (req, file, cb) => {
    cb(null, `bill-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

module.exports = {
  profile: multer({
    storage: profileStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }),
  receipt: multer({
    storage: receiptStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }),
  bill: multer({
    storage: billStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  })
};
