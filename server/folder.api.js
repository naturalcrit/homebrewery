// /server/folder.api.js

import express      from 'express';
import asyncHandler from 'express-async-handler';
import dbCheck      from './middleware/dbCheck.js';
import { model as FolderModel } from './folder.model.js';

const router = express.Router();

const requireAccount = (req, res, next)=>{
  if(!req.account)
    throw {
      HBErrorCode: 100,
      name: 'FolderAccess Error',
      message: 'Folder operations require a logged in user.',
      status: 401,
    };

  next();
};

router.use(dbCheck);


// handlers .............................................................

const createFolderApi = async (req, res)=>{
  const folder = await FolderModel.createFolder(req.account.username, {
    displayName: req.body.displayName || 'untitled folder',
    slug: req.body.slug,
    isPublished: req.body.isPublished ?? false,
  });

  if(!folder)
    throw {
      HBErrorCode: 105,
      name: 'FolderCreate Error',
      message: 'Folder could not be created',
      status: 404,
    };

  res.status(200).send(folder);
};

const updateFolderApi = async (req, res)=>{
  const folder = await FolderModel.updateFolder(
    req.account.username,
    req.params.folderId,
    req.body,
  );

  if(!folder)
    throw {
      HBErrorCode: 106,
      name: 'FolderUpdate Error',
      message: 'Folder to update could not be found',
      status: 404,
    };

  res.status(200).send(folder);
};


const deleteFolderApi = async (req, res)=>{
  const result = await FolderModel.deleteFolder(
    req.account.username,
    req.params.folderId,
  );

  if(!result.deletedCount)
    throw {
      HBErrorCode: 107,
      name: 'FolderDelete Error',
      message: 'Folder to delete could not be found',
      status: 404,
    };

  res.status(204).send();
};


const addBrewToFolderApi = async (req, res)=>{
  const result = await FolderModel.addBrewToFolder(
    req.account.username,
    req.params.folderId,
    req.body.brewId,
  );

  if (result?.error === 'FOLDER_NOT_FOUND') {
    throw {
      HBErrorCode: 111,
      name: 'FolderAddBrew Error',
      message: 'Folder to add brew to could not be found.',
      status: 404,
    };
  }

  if (result?.error === 'BREW_NOT_FOUND') {
    throw {
      HBErrorCode: 112,
      name: 'FolderAddBrew Error',
      message: 'Brew to add to folder could not be found.',
      status: 404,
    };
  }

  res.status(200).send(result);
};

const removeBrewFromFolderApi = async (req, res)=>{
  const result = await FolderModel.removeBrewFromFolder(
    req.account.username,
    req.params.folderId,
    req.params.brewId,
  );

  if (result?.error === 'FOLDER_NOT_FOUND') {
    throw {
      HBErrorCode: 113,
      name: 'FolderRemoveBrew Error',
      message: 'Folder to remove brew from could not be found',
      status: 404,
    };
  }

  if (result?.error === 'BREW_NOT_FOUND') {
    throw {
      HBErrorCode: 114,
      name: 'FolderRemoveBrew Error',
      message: 'Brew to remove from folder could not be found',
      status: 404,
    };
  }

  res.status(200).send(result);
};


// routes .............................................................

router.post('/api/folder/',
  requireAccount, asyncHandler(createFolderApi));

router.put('/api/folder/:folderId',
  requireAccount, asyncHandler(updateFolderApi));

router.delete('/api/folder/:folderId',
  requireAccount, asyncHandler(deleteFolderApi));


router.post('/api/folder/:folderId/brews',
  requireAccount, asyncHandler(addBrewToFolderApi));

router.delete('/api/folder/:folderId/brews/:brewId',
  requireAccount, asyncHandler(removeBrewFromFolderApi));


// ....................................................................

export default router;
