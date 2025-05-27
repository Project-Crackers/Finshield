const buildImmutableHashData = ({ description, amount, category, type, billImageUrl = '', user, prevHash, createdAt }) => {
  return `${description}-${amount}-${category}-${type}-${billImageUrl}-${user.toString()}-${prevHash}-${new Date(createdAt).toISOString()}`;
};

module.exports = { buildImmutableHashData };
