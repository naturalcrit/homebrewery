// /server/folder.api.spec.js

/* eslint-disable max-lines */

import { model as FolderModel } from './folder.model.js';

import {
  getByUserApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  addBrewToFolderApi,
  removeBrewFromFolderApi,
} from './folder.api.js';

jest.mock('./folder.model.js', ()=>({
  folderApiErrors: {
    '100': 'Account required',
  },
  model: {
    getByUser             : jest.fn(),
    getById               : jest.fn(),
    createFolder          : jest.fn(),
    updateFolder          : jest.fn(),
    deleteFolder          : jest.fn(),
    addBrewToFolder       : jest.fn(),
    removeBrewFromFolder  : jest.fn(),
  },
}));

jest.mock('./middleware/dbCheck.js', () => jest.fn((req, res, next) => next()));

describe('Tests for folder api', ()=>{
  let req;
  let res;

  beforeEach(()=>{
    jest.clearAllMocks();

    req = {
      account: {
        username: 'testuser',
      },
      params: {},
      body: {},
    };

    res = {
      status : jest.fn(()=>res),
      send   : jest.fn(()=>res),
    };
  });


  describe('getByUserApi', () => {

    it('should return the user folders', async () => {
      const folders = [{ title: 'My Folder' }];
      FolderModel.getById.mockResolvedValue(folders);

      await getByUserApi(req, res);

      expect(FolderModel.getByUser).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(folders);
    });

    it.each([
      [500, '110'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to get folders');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.getById.mockRejectedValue(error);

      await getByUserApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });


  describe('createFolderApi', ()=>{

    it('should create a folder and return HTTP 201', async () => {
      const folder = { id: 'folder123', title: 'My Folder' };

      req.body = {
        title: 'My Folder',
        slug: 'my-folder',
        isPublished: true,
        ignored: 'value',
      };

      FolderModel.createFolder.mockResolvedValue(folder);

      await createFolderApi(req, res);

      expect(FolderModel.createFolder).toHaveBeenCalledWith('testuser', {
        title: 'My Folder',
        slug: 'my-folder',
        isPublished: true,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(folder);
    });

    it.each([
      [404, '105'],
      [500, '120'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to create folder');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.createFolder.mockRejectedValue(error);

      await createFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });


  describe('updateFolderApi', ()=>{

    it('should update a folder and return HTTP 200', async () => {
      const folder = { id: 'folder123', title: 'Updated Folder' };
      const updates = { title: 'Updated Folder', slug: 'updated-folder' };

      req.params.folderId = 'folder123';
      req.body = updates;

      FolderModel.updateFolder.mockResolvedValue(folder);

      await updateFolderApi(req, res);

      expect(FolderModel.updateFolder).toHaveBeenCalledWith(
        'testuser',
        'folder123',
        updates,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(folder);
    });

    it.each([
      [409, '123'],
      [422, '121'],
      [404, '106'],
      [500, '108'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to update folder');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.updateFolder.mockRejectedValue(error);

      await updateFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });


  describe('deleteFolderApi', ()=>{

    it('should delete a folder and return HTTP 204 without a body', async () => {
      req.params.folderId = 'folder123';
      FolderModel.deleteFolder.mockResolvedValue({ deletedCount: 1 });

      await deleteFolderApi(req, res);

      expect(FolderModel.deleteFolder).toHaveBeenCalledWith(
        'testuser',
        'folder123',
      );

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it.each([
      [404, '107'],
      [500, '109'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to delete folder');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.deleteFolder.mockRejectedValue(error);

      await deleteFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });


  describe('addBrewToFolderApi', ()=>{

    it('should add a brew to a folder and return HTTP 200', async () => {
      const result = { folderId: 'folder123', brewId: 'brew123' };

      req.params.folderId = 'folder123';
      req.body.brewId = 'brew123';

      FolderModel.addBrewToFolder.mockResolvedValue(result);

      await addBrewToFolderApi(req, res);

      expect(FolderModel.addBrewToFolder).toHaveBeenCalledWith(
        'testuser',
        'folder123',
        'brew123',
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it.each([
      [404, '111'],
      [404, '112'],
      [500, '115'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to add brew');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.addBrewToFolder.mockRejectedValue(error);

      await addBrewToFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });


  describe('removeBrewFromFolderApi', ()=>{

    it('should remove a brew from a folder and return HTTP 200', async () => {
      const result = { folderId: 'folder123', brewId: 'brew123' };

      req.params.folderId = 'folder123';
      req.params.brewId = 'brew123';

      FolderModel.removeBrewFromFolder.mockResolvedValue(result);

      await removeBrewFromFolderApi(req, res);

      expect(FolderModel.removeBrewFromFolder).toHaveBeenCalledWith(
        'testuser',
        'folder123',
        'brew123',
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it.each([
      [404, '113'],
      [404, '114'],
      [500, '116'],
      [500, '999'],
      [500, undefined],
    ])('should return HTTP %i for error code %s', async (status, code) => {
      const error = new Error('Failed to remove brew');

      if (code !== undefined) error.HBErrorCode = code;

      FolderModel.removeBrewFromFolder.mockRejectedValue(error);

      await removeBrewFromFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.send).toHaveBeenCalledWith(error);
    });

  });

});
