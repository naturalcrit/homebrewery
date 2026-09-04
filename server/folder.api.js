// /server/folder.api.js

import express      from 'express';
import asyncHandler from 'express-async-handler';
import dbCheck      from './middleware/dbCheck.js';
import { model as FolderModel } from './folder.model.js';

const router = express.Router();

const requireAccount = (req, res, next)=>{
  if(!req.account)
    throw {
      name: 'Access Error',
      message: 'User is not logged in',
      status: 401,
    };

  next();
};

router.use(dbCheck);


const createFolderApi = async (req, res)=>{
  const folder = await FolderModel.createFolder(req.account.username, {
    displayName: req.body.displayName || 'untitled folder',
    slug: req.body.slug,
    isPublished: req.body.isPublished ?? false,
  });

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
      name: 'FolderUpdate Error',
      message: 'Folder not found',
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
      name: 'FolderDelete Error',
      message: 'Folder not found',
      status: 404,
    };

  res.status(204).send();
};


const addBrewToFolderApi = async (req, res)=>{
  const folder = await FolderModel.addBrewToFolder(
    req.account.username,
    req.params.folderId,
    req.body.brewId,
  );

  if(!folder)
    throw {
      name: 'FolderBrew Error',
      message: 'Folder or brew not found',
      status: 404,
    };

  res.status(200).send(folder);
};

const removeBrewFromFolderApi = async (req, res)=>{
  const folder = await FolderModel.removeBrewFromFolder(
    req.account.username,
    req.params.folderId,
    req.params.brewId,
  );

  if(!folder)
    throw {
      name: 'FolderBrew Error',
      message: 'Folder not found',
      status: 404,
    };

  res.status(200).send(folder);
};



router.post('/folder/',
  requireAccount, asyncHandler(createFolderApi));

router.put('/folder/:folderId',
  requireAccount, asyncHandler(updateFolderApi));

router.delete('/folder/:folderId',
  requireAccount, asyncHandler(deleteFolderApi));

router.post('/folder/:folderId/brewIds',
  requireAccount, asyncHandler(addBrewToFolderApi));

router.delete('/folder/:folderId/brewIds/:brewId',
  requireAccount, asyncHandler(removeBrewFromFolderApi));

export default router;
