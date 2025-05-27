const crypto = require('crypto');

// Generate a hash for blockchain security
const generateHash = (data) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

module.exports = {
  generateHash
};
