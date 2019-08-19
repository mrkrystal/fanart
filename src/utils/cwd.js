const process = require('process');

module.exports = (() => {
    const cwd = process.cwd();
    return () => {
        return cwd;
    };
})();
