const cloudinary= require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'the-progress-click', 
    api_key: '248192819842497', 
    api_secret: 'WzFO511jORuLDct8ihEWubpTSm8' 
  });

  module.exports = cloudinary;