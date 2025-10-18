// multerMiddleware.js (or replace the old upload middleware)
const multer = require('multer');

const uploadFileToMemory = () => {
  const storage = multer.memoryStorage(); // Store files in memory as Buffer
  return multer({ storage });
};

module.exports = uploadFileToMemory;
