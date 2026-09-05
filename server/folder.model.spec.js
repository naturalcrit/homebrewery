// /server/folder.model.spec.js

/* eslint-disable max-lines */

import mongoose from 'mongoose';
import { Folder } from './folder.model.js';
import { model as BrewModel } from './homebrew.model.js';

jest.mock('./homebrew.model.js', ()=>({
  model: {
    exists: jest.fn(),
  },
}));


describe('Folder model', ()=>{
  beforeEach(()=>{
    jest.restoreAllMocks();
  });


  describe('schema', ()=>{
    it('should apply defaults', ()=>{
      const folder = new Folder({
        owner : 'testuser',
        slug  : 'my-folder',
      });

      expect(folder.folderId).toHaveLength(12);
      expect(folder.displayName).toBe('untitled folder');
      expect(folder.brewIds).toEqual([]);
      expect(folder.subFolderIds).toEqual([]);
      expect(folder.isPublished).toBe(false);
      expect(folder.isPrivate).toBe(false);
      expect(folder.createdAt).toBeInstanceOf(Date);
      expect(folder.updatedAt).toBeInstanceOf(Date);
    });

    it('should require owner', ()=>{
      const folder = new Folder({
        slug : 'my-folder',
      });

      const error = folder.validateSync();

      expect(error.errors.owner).toBeDefined();
      expect(error.errors.owner.kind).toBe('required');
    });

    it('should require slug', ()=>{
      const folder = new Folder({
        owner : 'testuser',
      });

      const error = folder.validateSync();

      expect(error.errors.slug).toBeDefined();
      expect(error.errors.slug.kind).toBe('required');
    });

    it('should reject an empty slug', ()=>{
      const folder = new Folder({
        owner : 'testuser',
        slug  : '',
      });

      const error = folder.validateSync();

      expect(error.errors.slug).toBeDefined();
      expect(error.errors.slug.message).toBe('Path `slug` is required.');
    });

    it('should trim slug', ()=>{
      const folder = new Folder({
        owner : 'testuser',
        slug  : '  my-folder  ',
      });

      expect(folder.slug).toBe('my-folder');
    });

    it('should reject an empty displayName', ()=>{
      const folder = new Folder({
        owner       : 'testuser',
        slug        : 'my-folder',
        displayName : '',
      });

      const error = folder.validateSync();

      expect(error.errors.displayName).toBeDefined();
      expect(error.errors.displayName.message)
        .toBe('Path `displayName` is required.');
    });

    it('should trim displayName', ()=>{
      const folder = new Folder({
        owner       : 'testuser',
        slug        : 'my-folder',
        displayName : '  My Folder  ',
      });

      expect(folder.displayName).toBe('My Folder');
    });

    it('should generate unique folderIds', ()=>{
      const folder1 = new Folder({
        owner : 'testuser',
        slug  : 'one',
      });

      const folder2 = new Folder({
        owner : 'testuser',
        slug  : 'two',
      });

      expect(folder1.folderId).toHaveLength(12);
      expect(folder2.folderId).toHaveLength(12);
      expect(folder1.folderId).not.toBe(folder2.folderId);
    });
  });


  describe('getByUser', ()=>{
    it('should return all folders for the user when ownAccount is true', async ()=>{
      const folders = [
        {
          owner       : 'testuser',
          folderId    : 'abc123',
          slug        : 'one',
          displayName : 'One',
        },
      ];

      const lean = jest.fn(async ()=>folders);
      const select = jest.fn(()=>({ lean }));
      jest.spyOn(Folder, 'find').mockReturnValue({ select });

      const result = await Folder.getByUser('testuser', true);

      expect(Folder.find).toHaveBeenCalledWith({
        owner : 'testuser',
      });

      expect(select).toHaveBeenCalledWith(
        'owner folderId slug displayName brewIds subFolderIds isPublished isPrivate',
      );

      expect(result).toBe(folders);
    });

    it('should exclude private folders when ownAccount is false', async ()=>{
      const folders = [];

      const lean = jest.fn(async ()=>folders);
      const select = jest.fn(()=>({ lean }));
      jest.spyOn(Folder, 'find').mockReturnValue({ select });

      const result = await Folder.getByUser('testuser', false);

      expect(Folder.find).toHaveBeenCalledWith({
        owner     : 'testuser',
        isPrivate : false,
      });

      expect(result).toBe(folders);
    });
  });


  describe('createFolder', ()=>{
    it('should create and save a folder', async ()=>{
      const folder = {
        owner       : 'testuser',
        displayName : 'My Folder',
        slug        : 'my-folder',
        isPublished : true,
        isPrivate   : false,
      };

      const save = jest.fn(async ()=>folder);

      jest.spyOn(Folder.prototype, 'save').mockImplementation(save);

      const result = await Folder.createFolder('testuser', {
        displayName : 'My Folder',
        slug        : 'my-folder',
        isPublished : true,
        isPrivate   : false,
      });

      expect(save).toHaveBeenCalled();
      expect(result).toBe(folder);
    });

    it('should pass the supplied folder properties to the document', async ()=>{
      jest.spyOn(Folder.prototype, 'save')
        .mockImplementation(async function() {
          return this;
        });

      const result = await Folder.createFolder('testuser', {
        displayName : 'My Folder',
        slug        : 'my-folder',
        isPublished : true,
        isPrivate   : true,
      });

      expect(result.owner).toBe('testuser');
      expect(result.displayName).toBe('My Folder');
      expect(result.slug).toBe('my-folder');
      expect(result.isPublished).toBe(true);
      expect(result.isPrivate).toBe(true);
    });

    it('should propagate save errors', async ()=>{
      const error = new Error('database failure');

      jest.spyOn(Folder.prototype, 'save')
        .mockRejectedValue(error);

      await expect(
        Folder.createFolder('testuser', {
          displayName : 'My Folder',
          slug        : 'my-folder',
        }),
      ).rejects.toBe(error);
    });
  });


  describe('getFolder', ()=>{
    it('should find a folder belonging to the user', async ()=>{
      const folder = {
        owner    : 'testuser',
        folderId : 'abc123',
      };

      const lean = jest.fn(async ()=>folder);
      jest.spyOn(Folder, 'findOne').mockReturnValue({ lean });

      const result = await Folder.getFolder('testuser', 'abc123');

      expect(Folder.findOne).toHaveBeenCalledWith({
        owner    : 'testuser',
        folderId : 'abc123',
      });

      expect(lean).toHaveBeenCalled();
      expect(result).toBe(folder);
    });

    it('should return null when the folder does not exist', async ()=>{
      const lean = jest.fn(async ()=>null);
      jest.spyOn(Folder, 'findOne').mockReturnValue({ lean });

      const result = await Folder.getFolder('testuser', 'missing');

      expect(result).toBeNull();
    });
  });


  describe('updateFolder', ()=>{
    it('should update supplied fields', async ()=>{
      const folder = {
        owner       : 'testuser',
        folderId    : 'abc123',
        displayName : 'Updated',
      };

      const findOneAndUpdate = jest
        .spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(folder);

      await Folder.updateFolder('testuser', 'abc123', {
        displayName : 'Updated',
        slug        : 'updated',
        isPublished : true,
        isPrivate   : true,
      });

      const [query, update, options] = findOneAndUpdate.mock.calls[0];

      expect(query).toEqual({
        owner    : 'testuser',
        folderId : 'abc123',
      });

      expect(update.$set.displayName).toBe('Updated');
      expect(update.$set.slug).toBe('updated');
      expect(update.$set.isPublished).toBe(true);
      expect(update.$set.isPrivate).toBe(true);
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
      expect(options).toEqual({ new: true });
    });

    it('should not update fields that were not supplied', async ()=>{
      const findOneAndUpdate = jest
        .spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue({});

      await Folder.updateFolder('testuser', 'abc123', {
        displayName : 'Updated',
      });

      const [, update] = findOneAndUpdate.mock.calls[0];

      expect(update.$set).toEqual(
        expect.objectContaining({
          displayName : 'Updated',
        }),
      );

      expect(update.$set).not.toHaveProperty('slug');
      expect(update.$set).not.toHaveProperty('isPublished');
      expect(update.$set).not.toHaveProperty('isPrivate');
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null when the folder does not exist', async ()=>{
      jest.spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(null);

      const result = await Folder.updateFolder('testuser', 'missing', {
        displayName : 'Updated',
      });

      expect(result).toBeNull();
    });
  });


  describe('deleteFolder', ()=>{
    it('should delete the specified folder belonging to the user', async ()=>{
      const result = {
        acknowledged : true,
        deletedCount : 1,
      };

      jest.spyOn(Folder, 'deleteOne').mockResolvedValue(result);

      const actual = await Folder.deleteFolder('testuser', 'abc123');

      expect(Folder.deleteOne).toHaveBeenCalledWith({
        owner    : 'testuser',
        folderId : 'abc123',
      });

      expect(actual).toBe(result);
    });

    it('should return zero deletedCount when the folder does not exist', async ()=>{
      const result = {
        acknowledged : true,
        deletedCount : 0,
      };

      jest.spyOn(Folder, 'deleteOne').mockResolvedValue(result);

      const actual = await Folder.deleteFolder('testuser', 'missing');

      expect(actual).toBe(result);
    });
  });


  describe('addBrewToFolder', ()=>{
    it('should return BREW_NOT_FOUND when the brew does not exist', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue(null);

      const result = await Folder.addBrewToFolder(
        'testuser',
        'abc123',
        'missing-brew',
      );

      expect(result).toEqual({
        error : 'BREW_NOT_FOUND',
      });
    });

    it('should return FOLDER_NOT_FOUND when the folder does not exist', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue({ _id: 'brew' });

      jest.spyOn(Folder, 'exists')
        .mockResolvedValue(null);

      const result = await Folder.addBrewToFolder(
        'testuser',
        'missing-folder',
        'brew123',
      );

      expect(result).toEqual({
        error : 'FOLDER_NOT_FOUND',
      });

      expect(BrewModel.exists).toHaveBeenCalledWith({
        brewId : 'brew123',
      });

      expect(Folder.exists).toHaveBeenCalledWith({
        owner    : 'testuser',
        folderId : 'missing-folder',
      });
    });

    it('should add the brew to the folder', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue({ _id: 'brew' });

      jest.spyOn(Folder, 'exists')
        .mockResolvedValue({ _id: 'folder' });

      const folder = {
        owner    : 'testuser',
        folderId : 'abc123',
        brewIds  : ['brew123'],
      };

      const findOneAndUpdate = jest
        .spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(folder);

      const result = await Folder.addBrewToFolder(
        'testuser',
        'abc123',
        'brew123',
      );

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        {
          owner    : 'testuser',
          folderId : 'abc123',
        },
        expect.objectContaining({
          $addToSet : {
            brewIds : 'brew123',
          },
          $set : expect.objectContaining({
            updatedAt : expect.any(Date),
          }),
        }),
        { new: true },
      );

      expect(result).toBe(folder);
    });

    it('should return the updated folder', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue({ _id: 'brew' });

      jest.spyOn(Folder, 'exists')
        .mockResolvedValue({ _id: 'folder' });

      const folder = {
        owner    : 'testuser',
        folderId : 'abc123',
      };

      jest.spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(folder);

      const result = await Folder.addBrewToFolder(
        'testuser',
        'abc123',
        'brew123',
      );

      expect(result).toBe(folder);

      expect(BrewModel.exists).toHaveBeenCalledWith({
        brewId : 'brew123',
      });

      expect(Folder.findOneAndUpdate).toHaveBeenCalled();
    });
  });


  describe('removeBrewFromFolder', ()=>{
    it('should return BREW_NOT_FOUND when the brew does not exist', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue(null);

      const result = await Folder.removeBrewFromFolder(
        'testuser',
        'abc123',
        'missing-brew',
      );

      expect(result).toEqual({
        error : 'BREW_NOT_FOUND',
      });
    });

    it('should return FOLDER_NOT_FOUND when the folder does not exist', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue({ _id: 'brew' });

      jest.spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(null);

      const result = await Folder.removeBrewFromFolder(
        'testuser',
        'missing-folder',
        'brew123',
      );

      expect(result).toEqual({
        error : 'FOLDER_NOT_FOUND',
      });
    });

    // FAILS
    it('should remove the brew from the folder', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue(null);

      const folder = {
        owner    : 'testuser',
        folderId : 'abc123',
        brewIds  : [],
      };

      const findOneAndUpdate = jest
        .spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(folder);

      const result = await Folder.removeBrewFromFolder(
        'testuser',
        'abc123',
        'brew123',
      );

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        {
          owner    : 'testuser',
          folderId : 'abc123',
        },
        expect.objectContaining({
          $pull : {
            brewIds : 'brew123',
          },
          $set : expect.objectContaining({
            updatedAt : expect.any(Date),
          }),
        }),
        { new: true },
      );

      expect(result).toBe(folder);
    });

    it('should return the updated folder', async ()=>{
      jest.spyOn(BrewModel, 'exists')
        .mockResolvedValue({ _id: 'brew' });

      const folder = {
        owner    : 'testuser',
        folderId : 'abc123',
      };

      jest.spyOn(Folder, 'findOneAndUpdate')
        .mockResolvedValue(folder);

      const result = await Folder.removeBrewFromFolder(
        'testuser',
        'abc123',
        'brew123',
      );

      expect(result).toBe(folder);
    });
  });

});
