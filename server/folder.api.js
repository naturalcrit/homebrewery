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

// TODO: all handlers need to wrap FolderModel.* calls in try/catch
// NOTE: expect non-success results to come via throws
// NOTE: mostly just update error.status(x) and res.status(x) .. 500, 409, 422, etc
// NOTE: shouldn't need to add/modify HBErrorCode here, use what was thrown

const getByUserApi = async (req, res)=>{
  try {
    const folder = await FolderModel.getById(req.account.username, /* ownAccount */);

    if(!folder) {
      const error = {
        HBErrorCode: '105',
        name: 'Get User Folders Error',
        status: 500,
      };
      error.message = folderError(error.HBErrorCode);

      throw error;
    }

    res.status(201).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '101' : httpstatus = 409; break;
      case '120' : httpstatus = 404; break;
      case '121' : httpstatus = 422; break;
      case '110' : httpstatus = 500; break;
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
    });

    if(!folder) {
      // TODO throw 409 for slug conflict (HBErrorCode 101)
      // TODO throw 422 if slug invalid (HBErrorCode 121)
      const error = {
        HBErrorCode: '105',
        name: 'FolderCreate Error',
        status: 500,
      };
      error.message = folderApiErrors[error.HBErrorCode];

      throw error;
    }

    res.status(201).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '121' : httpstatus = 422; break;
      case '105' : httpstatus = 404; break;
      default:
        httpstatus = 500;
    }

    res.status(httpstatus).send(error);
  }
};

const updateFolderApi = async (req, res)=>{
  try {
    // TODO: throw 409 if slug already in this parent

    const folder = await FolderModel.updateFolder(
      req.account.username,
      req.params.folderId,
      req.body,
    );

    if(!folder) {
      const error = {
        HBErrorCode: '106',
        name: 'FolderUpdate Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    res.status(200).send(folder);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '121' : httpstatus = 422; break;
      case '106' : httpstatus = 404; break;
      case '108' : httpstatus = 500; break;
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

    if(!result.deletedCount) {
      const error = {
        HBErrorCode: '107',
        name: 'FolderDelete Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    res.status(204).send(); // NOTE: do not send a body with 204
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '107' : httpstatus = 404; break;
      case '109' : httpstatus = 500; break;
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

    if (result?.error === 'FOLDER_NOT_FOUND') {
      const error = {
        HBErrorCode: '111',
        name: 'FolderAddBrew Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    if (result?.error === 'BREW_NOT_FOUND') {
      const error = {
        HBErrorCode: '112',
        name: 'FolderAddBrew Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    res.status(200).send(result);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '111' : httpstatus = 404; break;
      case '112' : httpstatus = 404; break;
      case '115' : httpstatus = 500; break;
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

    if (result?.error === 'FOLDER_NOT_FOUND') {
      const error = {
        HBErrorCode: '113',
        name: 'FolderRemoveBrew Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    if (result?.error === 'BREW_NOT_FOUND') {
      const error = {
        HBErrorCode: '114',
        name: 'FolderRemoveBrew Error',
        status: 404,
      };
      error.message = folderApiErrors[error.HBErrorCode];
      throw error;
    }

    res.status(200).send(result);
  }
  catch (error) {
    let httpstatus;
    switch (error.HBErrorCode ?? '') {
      case '113' : httpstatus = 404; break;
      case '114' : httpstatus = 404; break;
      case '116' : httpstatus = 500; break;
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
