const fs = require('fs');
const path = require('path');
const dataPath = name => path.join(__dirname, '..', 'data', `${name}.json`);
const read = name => JSON.parse(fs.readFileSync(dataPath(name), 'utf8'));
const write = (name, value) => fs.writeFileSync(dataPath(name), JSON.stringify(value, null, 2));
module.exports = { read, write };
