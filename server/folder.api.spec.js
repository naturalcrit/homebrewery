// /server/folder.api.spec.js

/* eslint-disable max-lines */

jest.mock('./folder.model.js', ()=>({
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

import { model as FolderModel } from './folder.model.js';
import * as api                 from './folder.api.js';

describe('Tests for folder api', ()=>{
  let res;

  beforeEach(()=>{
    jest.clearAllMocks();

    res = {
      status : jest.fn(()=>res),
      send   : jest.fn(()=>{}),
    };
  });

  describe('getByUserApi', () => {


  });


  describe('createFolderApi', ()=>{


  });


  describe('updateFolderApi', ()=>{


  });


  describe('deleteFolderApi', ()=>{


  });


  describe('addBrewToFolderApi', ()=>{


  });


  describe('removeBrewFromFolderApi', ()=>{


  });


  describe('requireAccount', ()=>{


  });

});
