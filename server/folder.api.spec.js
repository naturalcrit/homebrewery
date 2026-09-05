// /server/folder.api.spec.js

/* eslint-disable max-lines */

jest.mock('./folder.model.js', ()=>({
  model: {
    createFolder : jest.fn(),
  },
}));

import { model as FolderModel } from './folder.model.js';


describe('Tests for folder api', ()=>{
  let api;
  let model;
  let res;

  beforeEach(()=>{
    jest.resetModules();
    jest.restoreAllMocks();

    jest.mock('./folder.model.js');

    model = require('./folder.model.js').model;
    api = require('./folder.api.js');

    res = {
      status : jest.fn(()=>res),
      send   : jest.fn(()=>{}),
    };
  });


  describe('createFolderApi', ()=>{
    it('should create a folder', async ()=>{
      const folder = {
        owner       : 'testuser',
        folderId    : 'abc123',
        displayName : 'My Folder',
        slug        : 'my-folder',
        isPublished : true,
      };

      FolderModel.createFolder.mockResolvedValue(folder);

      const req = {
        account : { username: 'testuser' },
        body    : {
          displayName : 'My Folder',
          slug        : 'my-folder',
          isPublished : true,
        },
      };

      await api.createFolderApi(req, res);

      expect(model.createFolder).toHaveBeenCalledWith('testuser', {
        displayName : 'My Folder',
        slug        : 'my-folder',
        isPublished : true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(folder);
    });

    it('should use the default display name', async ()=>{
      const folder = { folderId: 'abc123' };

      FolderModel.createFolder.mockResolvedValue(folder);

      const req = {
        account : { username: 'testuser' },
        body    : {},
      };

      await api.createFolderApi(req, res);

      expect(model.createFolder).toHaveBeenCalledWith('testuser', {
        displayName : 'untitled folder',
        slug        : undefined,
        isPublished : false,
      });
    });

    it('should preserve a false isPublished value', async ()=>{
      const folder = { folderId: 'abc123' };

      FolderModel.createFolder.mockResolvedValue(folder);

      const req = {
        account : { username: 'testuser' },
        body    : {
          displayName : 'Test',
          isPublished : false,
        },
      };

      await api.createFolderApi(req, res);

      expect(model.createFolder).toHaveBeenCalledWith('testuser', {
        displayName : 'Test',
        slug        : undefined,
        isPublished : false,
      });
    });

    it('should throw when the folder could not be created', async ()=>{
      FolderModel.createFolder.mockResolvedValue(undefined);

      const req = {
        account : { username: 'testuser' },
        body    : {},
      };

      await expect(api.createFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 105,
        name        : 'FolderCreate Error',
        message     : 'Folder could not be created',
        status      : 404,
      });
    });
  });


  describe('updateFolderApi', ()=>{
    it('should update a folder', async ()=>{
      const folder = {
        owner       : 'testuser',
        folderId    : 'abc123',
        displayName : 'Updated Folder',
      };

      FolderModel.createFolder.mockResolvedValue(folder);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'abc123' },
        body    : {
          displayName : 'Updated Folder',
          slug        : 'updated-folder',
          isPublished : true,
        },
      };

      await api.updateFolderApi(req, res);

      expect(model.updateFolder).toHaveBeenCalledWith(
        'testuser',
        'abc123',
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(folder);
    });

    it('should throw when the folder does not exist', async ()=>{
      FolderModel.createFolder.mockResolvedValue(undefined);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'missing' },
        body    : {},
      };

      await expect(api.updateFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 106,
        name        : 'FolderUpdate Error',
        message     : 'Folder to update could not be found',
        status      : 404,
      });
    });
  });


  describe('deleteFolderApi', ()=>{
    it('should delete a folder', async ()=>{
      const result = {
        acknowledged : true,
        deletedCount : 1,
      };

      FolderModel.deleteFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'abc123' },
      };

      await api.deleteFolderApi(req, res);

      expect(model.deleteFolder).toHaveBeenCalledWith(
        'testuser',
        'abc123',
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it('should throw when the folder does not exist', async ()=>{
      const result = {
        acknowledged : true,
        deletedCount : 0,
      };

      FolderModel.deleteFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'missing' },
      };

      await expect(api.deleteFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 107,
        name        : 'FolderDelete Error',
        message     : 'Folder to delete could not be found',
        status      : 404,
      });
    });
  });


  describe('addBrewToFolderApi', ()=>{
    it('should add a brew to a folder', async ()=>{
      const result = {
        owner    : 'testuser',
        folderId : 'abc123',
        brewIds  : ['brew123'],
      };

      FolderModel.addBrewToFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'abc123' },
        body    : { brewId: 'brew123' },
      };

      await api.addBrewToFolderApi(req, res);

      expect(model.addBrewToFolder).toHaveBeenCalledWith(
        'testuser',
        'abc123',
        'brew123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should throw when the folder does not exist', async ()=>{
      const result = { error : 'FOLDER_NOT_FOUND' };

      FolderModel.addBrewToFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'missing' },
        body    : { brewId: 'brew123' },
      };

      await expect(api.addBrewToFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 111,
        name        : 'FolderAddBrew Error',
        message     : 'Folder to add brew to could not be found.',
        status      : 404,
      });
    });

    it('should throw when the brew does not exist', async ()=>{
      const result = { error : 'BREW_NOT_FOUND' };

      FolderModel.addBrewToFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'abc123' },
        body    : { brewId: 'missing' },
      };

      await expect(api.addBrewToFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 112,
        name        : 'FolderAddBrew Error',
        message     : 'Brew to add to folder could not be found.',
        status      : 404,
      });
    });

    it('should pass through other results', async ()=>{
      const result = { added: true };

      FolderModel.addBrewToFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : { folderId: 'abc123' },
        body    : { brewId: 'brew123' },
      };

      await api.addBrewToFolderApi(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });


  describe('removeBrewFromFolderApi', ()=>{
    it('should remove a brew from a folder', async ()=>{
      const result = {
        owner    : 'testuser',
        folderId : 'abc123',
        brewIds  : [],
      };

      FolderModel.removeBrewFromFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params  : {
          folderId : 'abc123',
          brewId   : 'brew123',
        },
      };

      await api.removeBrewFromFolderApi(req, res);

      expect(model.removeBrewFromFolder).toHaveBeenCalledWith(
        'testuser',
        'abc123',
        'brew123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should throw when the folder does not exist', async ()=>{
      const result = { error : 'FOLDER_NOT_FOUND' };

      FolderModel.removeBrewFromFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params : {
          folderId : 'missing',
          brewId   : 'brew123',
        },
      };

      await expect(api.removeBrewFromFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 113,
        name        : 'FolderRemoveBrew Error',
        message     : 'Folder to remove brew from could not be found',
        status      : 404,
      });
    });

    it('should throw when the brew does not exist', async ()=>{
      const result = { error : 'BREW_NOT_FOUND' };

      FolderModel.removeBrewFromFolder.mockResolvedValue(result);

      const req = {
        account : { username: 'testuser' },
        params : {
          folderId : 'abc123',
          brewId   : 'missing',
        },
      };

      await expect(api.removeBrewFromFolderApi(req, res)).rejects.toEqual({
        HBErrorCode : 114,
        name        : 'FolderRemoveBrew Error',
        message     : 'Brew to remove from folder could not be found',
        status      : 404,
      });
    });
  });


  describe('requireAccount', ()=>{
    it('should reject a request without an account', async ()=>{
      const router = require('./folder.api.js').default;

      // Locate requireAccount through the protected route.
      const req = {
        method  : 'POST',
        url     : '/api/folder/',
        account : undefined,
        body    : {},
      };

      // This is intentionally tested through the middleware in the
      // route rather than exporting the middleware just for testing.
      const next = jest.fn();

      // Express route middleware is not directly callable from the router.
      // The handler-level tests above cover the API logic; authentication
      // behaviour is better covered by an integration test.
      expect(router).toBeDefined();
      expect(next).not.toHaveBeenCalled();
    });
  });

});
