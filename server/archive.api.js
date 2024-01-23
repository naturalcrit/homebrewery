const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const asyncHandler = require('express-async-handler');


const archive = {
    archiveApi : router,
    /* Searches for matching title, also attempts to partial match */
    findBrews  : async (req, res, next) => {
        try {
          const brews = await HomebrewModel.find({
            title: { $regex: req.params.query, $options: 'i' },
            published: true
          }).exec();
      
          if (!brews || brews.length === 0) {
            // No published documents found with the given title
            return res.status(404).json({ error: 'Published documents not found' });
          }
      
          return res.json(brews);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
router.get('/archive/:query', asyncHandler(archive.findBrews));


module.exports = archive;