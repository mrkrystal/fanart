const cwd = require('../src/utils/cwd.js');
const path = require('path');

module.exports = {
    temp: path.join(cwd(), '_temp'),
    store: path.join(cwd(), 'store'),
};
