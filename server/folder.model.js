// /server/folder.model.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { model as BrewModel } from './homebrew.model.js';


const FolderSchema = mongoose.Schema({
  owner:        { type: String, required: true, index: true },
  folderId:     { type: String, required: true, default: () => nanoid(12), index: true, unique: true },
  slug:         { type: String, required: true },
  displayName:  { type: String, required: true, default: '' },
  brewIds:      { type: [String], default: [] },
  subfolderIds: { type: [String], default: [] },
  isPublished:  { type: Boolean, default: false },
  isPrivate:    { type: Boolean, default: false },
  isBookmarks:  { type: Boolean, default: false },
  isFavourites: { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
}, { versionKey: false });

FolderSchema.index(
  { owner: 1, isBookmarks: 1 },
  { unique: true, partialFilterExpression: { isBookmarks: true } }
);

FolderSchema.index(
  { owner: 1, isFavourites: 1 },
  { unique: true, partialFilterExpression: { isFavourites: true } }
);

// Application code validates slug for syntax, and also sibling uniqueness

// Folders can contain sub-folders, as a DAG, not a tree
// subfolderIds contains outgoing edges in the folder DAG
// Application code prevents self-references and cycles

// No semantics implied by array order of brewIds or subfolderIds.

// isPublished determines if the folder appears in the User's Published Brews section of their user page
// isPrivate means non-owners cannot view the folder even if they have the url

// isBookmarks signifies this folder is used for bookmarks
// isFavourites signifies this folder is used for favourites
// both by default would be created with isPrivate = true.

// updatedAt is managed in the app.

const Folder = mongoose.model('Folder', FolderSchema);


// Folder operations ...

FolderSchema.statics.getByUser = async function(username, ownAccount) {
  const query = { owner: username };

  if(!ownAccount)
    query.isPrivate = false;

  return this.find(query)
    .select(
      'owner folderId slug displayName brewIds subFolderIds isPublished isPrivate isBookmarks isFavourites'
    )
    .lean();
};


FolderSchema.statics.createFolder = async function(owner, { displayName = '', slug, isPublished = false, isBookmarks = false } ) {
  const folder = new this({
    owner,
    displayName,
    slug,
    isPublished,
    isBookmarks,
  });

  return folder.save();
};

FolderSchema.statics.getFolder = async function(owner, folderId) {
  return this.findOne({ owner, folderId });
};

FolderSchema.statics.updateFolder = async function(owner, folderId, { displayName, slug, isPublished }) {
  const result = await this.updateOne(
    { owner, folderId },
    {
      $set: {
        displayName,
        slug,
        isPublished,
        updatedAt: new Date(),
      },
    },
  );

  if(!result.matchedCount)
    return null;

  return this.getFolder(owner, folderId);
};

FolderSchema.statics.deleteFolder = async function(owner, folderId) {
  return this.deleteOne({ owner, folderId });
};


FolderSchema.statics.addBrewToFolder = async function( owner, folderId, brewId) {
  const folder = await this.getFolder(owner, folderId);

  if(!folder)
    return null;

  const brew = await BrewModel.findOne({ owner, brewId });

  if(!brew)
    return null;

  await this.updateOne(
    { owner, folderId },
    {
      $addToSet: { brewIds: brewId },
      $set: { updatedAt: new Date() },
    },
  );

  return this.getFolder(owner, folderId);
};

FolderSchema.statics.removeBrewFromFolder = async function( owner, folderId, brewId ) {
  const result = await this.updateOne(
    { owner, folderId },
    {
      $pull: { brewIds: brewId },
      $set: { updatedAt: new Date() },
    },
  );

  if(!result.matchedCount)
    return null;

  return this.getFolder(owner, folderId);
};


FolderSchema.statics.getBookmarksFolder = async function(owner) {
  return this.findOne({ owner, isBookmarks: true });
};

FolderSchema.statics.addBookmark = async function(owner, brewId) {
  let folder = await this.getBookmarksFolder(owner);

  if(!folder) {
    try {
      // handle concurrency/race condition
      folder = await this.createFolder(owner, {
        displayName: 'Bookmarks',
        slug: 'bookmarks',
        isBookmarks: true,
      });
    }
    catch(err) {
      if(err.code !== 11000) // duplicate-key error from isBookmarks constraint
        throw err;

      // return the real slim shady
      folder = await this.getBookmarksFolder(owner);
    }
  }

  return this.addBrewToFolder(owner, folder.folderId, brewId);
};
