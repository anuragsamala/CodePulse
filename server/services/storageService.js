const fs = require('fs');
const path = require('path');

class LocalStorageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    // Returns relative path or URL for access
    return /uploads/;
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  }
}

// Interface ready to swap with S3 / Cloudinary / Supabase
module.exports = new LocalStorageService();
