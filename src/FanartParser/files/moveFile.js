const { promisify } = require('util');
const fs = require('fs');

const awaitableRename = promisify(fs.rename);

module.exports = async (from, to) => {
    await awaitableRename(from, to);
};
