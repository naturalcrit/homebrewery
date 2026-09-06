// /server/folder.model.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { model as BrewModel } from './homebrew.model.js';


const FolderSchema = mongoose.Schema({
  author:       { type: String, required: true, index: true },
  folderId:     { type: String, required: true, index: true, unique: true, default: () => nanoid(12) },
  slug:         { type: String, required: true, trim: true, },
  title:        { type: String, required: true, trim: true, default: 'untitled folder', },
  brewIds:      { type: [String], default: [] },
  subFolderIds: { type: [String], default: [] },
  isPublished:  { type: Boolean, required: true, default: false },
  isPrivate:    { type: Boolean, required: true, default: false },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
}, { versionKey: false });

// Application code validates slug for syntax, and also sibling uniqueness

// Folders can contain sub-folders, as a DAG, not a tree
// subfolderIds contains outgoing edges in the folder DAG
// Application code prevents self-references and cycles

// No semantics implied by array order of brewIds or subfolderIds.

// isPublished determines appearance in the User's Published Brews section of their user page
// isPrivate means non-authors cannot view the folder even if they have the url

// updatedAt is managed in the app.


// Folder operations .........................................................

FolderSchema.statics.getByUser = async function(username, ownAccount) {
  const query = { author: username };

  if(!ownAccount)
    query.isPrivate = false;

  return this.find(query)
    .select(
      'author folderId slug title brewIds subFolderIds isPublished isPrivate'
    )
    .lean();
};


FolderSchema.statics.createFolder = async function(
  author,
  { title, slug, isPublished, isPrivate }
) {
  // TODO: enforce slug uniqueness within parent folders? [TRICKY]
  // TODO: pass in parent folderId, add this folderId to parent.subFolderIds[]
  const folder = new this({
    author,
    title,
    slug,
    isPublished,
    isPrivate,
  });

  return folder.save();
};

FolderSchema.statics.getFolder = async function(author, folderId) {
  // returns folder document, or null
  return this.findOne({ author, folderId }).lean();
  // NOTE: don't throw here if not found, different callers = different messaging
};

FolderSchema.statics.updateFolder = async function(
  author,
  folderId,
  { title, slug, isPublished, isPrivate }
) {
  const updates = {
    title,
    slug,
    isPublished,
    isPrivate,
    updatedAt: new Date()
  };

  // Remove fields that weren't supplied.
  Object.keys(updates).forEach(key => {
    if(updates[key] === undefined)
      delete updates[key];
  });

  const folder = await this.findOneAndUpdate(
    { author, folderId },
    { $set: updates },
    { new: true },
  );

  return folder;
};

FolderSchema.statics.deleteFolder = async function(author, folderId) {
  // TODO: remove dangling references to this folderId. not essential, just tidy.
  return this.deleteOne({ author, folderId });
};


FolderSchema.statics.addBrewToFolder = async function( author, folderId, brewId) {

  const brewExists = await BrewModel.exists({ brewId });
  if(!brewExists)
    return { error: 'BREW_NOT_FOUND' };

  const folderExists = await this.exists({ author, folderId });
  if(!folderExists)
    return { error: 'FOLDER_NOT_FOUND' };

  const result = await this.findOneAndUpdate(
    { author, folderId },
    {
      $addToSet: { brewIds: brewId },
      $set: { updatedAt: new Date() },
    },
    { new: true },
  );

  return result;
};

FolderSchema.statics.removeBrewFromFolder = async function( author, folderId, brewId ) {
  // returns null, or returns updated folder

  const brewExists = await BrewModel.exists({ brewId });
  if(!brewExists)
    return { error: 'BREW_NOT_FOUND' };

  const result = await this.findOneAndUpdate(
    { author, folderId },
    {
      $pull: { brewIds: brewId },
      $set: { updatedAt: new Date() },
    },
    { new: true },
  );

  if (!result)
    return { error: 'FOLDER_NOT_FOUND' };

  return result;
};


// TODO: MVP+1 = add bookmarks wrappers

// TODO: MVP+n = add nesting of folders
// FolderSchema.statics.addFolderToFolder = async function( author, parentFolderId, childFolderId) ...
// FolderSchema.statics.removeFolderFromFolder = async function( author, parentFolderId, childFolderId ) ...

// ----------------------------------------------------------------------

// Now compile the model ...
const Folder = mongoose.model('Folder', FolderSchema);

export { Folder };
