// /server/folder.api.js

import { model as FolderModel } from './folder.model.js';
import express      from 'express';
import asyncHandler from 'express-async-handler';
import dbCheck      from './middleware/dbCheck.js';

const router = express.Router();

// error codes ...........................................................

const folderApiErrors = {
  '100': `Folder operations require a logged in user.`,
  '101': `A folder with this identifier already exists`,
  '102': `A bookmarks folder already exists`,
  '103': `A favorites folder already exists`,

  '104': `Folder could not be found.`,
  '105': `Folder could not be created.`,

  '106': `Folder to update could not be found.`,
  '107': `Folder to delete could not be found.`,

  '111': `Folder to add brew to could not be found.`,
  '112': `Brew to add to folder could not be found.`,
  '113': `Folder to remove brew from could not be found.`,
  '114': `Brew to remove from folder could not be found.`,

  '121': `Folder slug is not valid`,
};

// utilities .............................................................

const requireAccount = (req, res, next)=>{
  if(!req.account) {
    const error = {
      HBErrorCode: 100,
      name: 'FolderAccess Error',
      status: 401,
    };
    error.message = folderApiErrors[error.HBErrorCode];

    throw error;
  }

  next();
};

router.use(dbCheck);


// handlers .............................................................

const createFolderApi = async (req, res)=>{

  const folder = await FolderModel.createFolder(req.account.username, {
    title: req.body.title,
    slug: req.body.slug,
    isPublished: req.body.isPublished,
  });

  if(!folder) {
    const error = {
      HBErrorCode: 105,
      name: 'FolderCreate Error',
      status: 500,
    };
    error.message = folderApiErrors[error.HBErrorCode];

    throw error;
  }

  res.status(200).send(folder);
};

const updateFolderApi = async (req, res)=>{
  const folder = await FolderModel.updateFolder(
    req.account.username,
    req.params.folderId,
    req.body,
  );

  if(!folder) {
    const error = {
      HBErrorCode: 106,
      name: 'FolderUpdate Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
  }

  res.status(200).send(folder);
};


const deleteFolderApi = async (req, res)=>{
  const result = await FolderModel.deleteFolder(
    req.account.username,
    req.params.folderId,
  );

  if(!result.deletedCount) {
    const error = {
      HBErrorCode: 107,
      name: 'FolderDelete Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
  }

  res.status(204).send();
};


const addBrewToFolderApi = async (req, res)=>{
  const result = await FolderModel.addBrewToFolder(
    req.account.username,
    req.params.folderId,
    req.body.brewId,
  );

  if (result?.error === 'FOLDER_NOT_FOUND') {
    const error = {
      HBErrorCode: 111,
      name: 'FolderAddBrew Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
  }

  if (result?.error === 'BREW_NOT_FOUND') {
    const error = {
      HBErrorCode: 112,
      name: 'FolderAddBrew Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
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
    const error = {
      HBErrorCode: 113,
      name: 'FolderRemoveBrew Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
  }

  if (result?.error === 'BREW_NOT_FOUND') {
    const error = {
      HBErrorCode: 114,
      name: 'FolderRemoveBrew Error',
      status: 404,
    };
    error.message = folderApiErrors[error.HBErrorCode];
    throw error;
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

export {
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  addBrewToFolderApi,
  removeBrewFromFolderApi,
};

export default router;
