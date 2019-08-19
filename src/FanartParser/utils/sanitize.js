const sanitizeFilename = require('sanitize-filename');

module.exports = (string) => {
    return sanitizeFilename(string.replace(/\//g, '-').replace(/[=?><\\:*|"\s]/g, '_'));
};
