const sanitize = require('../../../src/FanartParser/utils/sanitize.js');

module.exports = (data, extension) => {
    return `${[sanitize(data.creator), sanitize(data.title), sanitize(data.id)].join('=')}.${extension}`;
};
