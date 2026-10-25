// /server/folder.api.js

import { folderApiErrors, model as FolderModel } from './folder.model.js';
import express      from 'express';
import asyncHandler from 'express-async-handler';
import dbCheck      from './middleware/dbCheck.js';

const router = express.Router();

// utilities .............................................................

const requireAccount = (req, res, next)=>{
  if(!req.account) {
    const error = {
      HBErrorCode: '100',
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

const getByUserApi = async (req, res)=>{
  try {
    const ownAccount = req.account && (req.account.username == req.params.username);
    const folder = await FolderModel.getByUser(req.params.username, ownAccount);

    res.status(200).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '120' : httpstatus = 404; break; // author doesn't exist
      case '110' : httpstatus = 500; break; // generic error
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const createFolderApi = async (req, res)=>{
  try {
    const folder = await FolderModel.createFolder(req.account.username, {
      title: req.body.title,
      slug: req.body.slug,
      isPublished: req.body.isPublished,
      isPrivate: req.body.isPrivate,
    });

    res.status(201).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '101' : httpstatus = 409; break; // folder with identifier already exists
      case '121' : httpstatus = 422; break; // slug not valid
      case '105' : httpstatus = 500; break; // generic, folder could not be created
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const updateFolderApi = async (req, res)=>{
  try {
    const folder = await FolderModel.updateFolder(
      req.account.username,
      req.params.folderId,
      req.body,
    );

    res.status(200).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '123' : httpstatus = 409; break; // slug not locally unique
      case '121' : httpstatus = 422; break; // slug is not valid
      case '106' : httpstatus = 404; break; // folder not found
      case '108' : httpstatus = 500; break; // generic folder update error
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const deleteFolderApi = async (req, res)=>{
  try {
    const result = await FolderModel.deleteFolder(
      req.account.username,
      req.params.folderId,
    );
    // NOTE: nothing deleted -> error thrown (not delected.Count == 0)

    res.status(204).send(); // NOTE: do not send a body with 204
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '107' : httpstatus = 404; break; // folder could not be found
      case '109' : httpstatus = 500; break; // folder could not be deleted
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const addBrewToFolderApi = async (req, res)=>{
  try {
    const result = await FolderModel.addBrewToFolder(
      req.account.username,
      req.params.folderId,
      req.body.brewId,
    );

    res.status(200).send(result);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '111' : httpstatus = 404; break; // folder not found
      case '112' : httpstatus = 404; break; // brew not found
      case '115' : httpstatus = 500; break; // generic error
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const removeBrewFromFolderApi = async (req, res)=>{
  try {
    const result = await FolderModel.removeBrewFromFolder(
      req.account.username,
      req.params.folderId,
      req.params.brewId,
    );

    res.status(200).send(result);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '113' : httpstatus = 404; break; // folder not found
      case '114' : httpstatus = 404; break; // brew not found
      case '116' : httpstatus = 500; break; // generic error
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};


// routes .............................................................

router.get('/api/user/:username/folders',
  requireAccount, asyncHandler(getByUserApi));

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
  getByUserApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  addBrewToFolderApi,
  removeBrewFromFolderApi,
};

export default router;
