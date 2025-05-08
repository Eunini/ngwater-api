const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  const uuid = uuidv4();
  return `PRJ-${uuid.split('-')[0].toUpperCase()}`;
};