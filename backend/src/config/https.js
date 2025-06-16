const fs = require('fs');
const path = require('path');

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../../ssl/private.key')),
    cert: fs.readFileSync(path.join(__dirname, '../../ssl/certificate.crt'))
};

module.exports = httpsOptions; 