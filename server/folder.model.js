// /server/folder.model.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { model as BrewModel } from './homebrew.model.js';


const FolderSchema = mongoose.Schema({
  author:       { type: String, required: true, index: true },
  folderId:     { type: String, required: true, index: true, unique: true, default: () => nanoid(12) },
  slug:         { type: String, required: true, trim: true, lowercase: true,
    match: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, },
  title:        { type: String, required: true, trim: true, default: 'untitled folder', },
  shareIds:     { type: [String], default: [] },
  subFolderIds: { type: [String], default: [] },
  isPublished:  { type: Boolean, required: true, default: false },
  isPrivate:    { type: Boolean, required: true, default: false },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
}, { versionKey: false });

// Application code validates slug for syntax, and also sibling uniqueness

// Folders reference brew shareIds.

// Folders can contain sub-folders, as a DAG, not a tree
// subfolderIds contains outgoing edges in the folder DAG
// Application code prevents self-references and cycles

// No semantics implied by array order of shareIds or subfolderIds.

// isPublished determines appearance in the User's Published Brews section of their user page
// isPrivate means non-authors cannot view the folder even if they have the url

// updatedAt is managed in the app.

// Error codes ...........................................................

const folderApiErrors = {
// TODO: sanity these numbers

  // constraints
  '100': `Folder operations require a logged in user.`,
  '101': `A folder with this identifier already exists`,
  '102': `A bookmarks folder already exists`,
  '103': `A favorites folder already exists`,

  '110': `An error occurred trying to find folders for the user.`,
  '120': `The author username could not be found`,  // ???

  // crud
  '105': `Folder could not be created.`,
  '104': `Folder could not be found.`,
  '108': `Folder could not be updated.`,
  '109': `Folder could not be deleted.`,

  '106': `Folder to update could not be found.`,    // do we need separate codes??
  '107': `Folder to delete could not be found.`,    // do we need separate codes??

  // graph integrity
  '111': `Folder to add brew to could not be found.`,
  '112': `Brew to add to folder could not be found.`,
  '113': `Folder to remove brew from could not be found.`,
  '114': `Brew to remove from folder could not be found.`,

  '115': `An error occurred while adding brew to folder`,
  '116': `An error occurred while removing brew from folder`,
  '117': `An error occurred while retrieving the folder`,

  // validation
  '121': `Folder slug is not valid`,
};

// Folder utilities ..........................................................

function slugify(str) {
  if (str == null || str == undefined)  {
    throw new TypeError("slugify() expects a value.");
  }

  str = String(str);

  return str
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")    // Remove special characters
    .replace(/[\s_-]+/g, "-")         // Spaces/underscores → hyphens
    .replace(/^-+|-+$/g, "");         // Trim hyphens
}


// Folder operations .........................................................

FolderSchema.statics.getByUser = async function(username, ownAccount) {
  const query = { author: username };

  if(!ownAccount)
    query.isPrivate = false;

  return this.find(query)
    .select(
      'author folderId slug title shareIds subFolderIds isPublished isPrivate'
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
      $addToSet: { shareIds: brewId },
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
      $pull: { shareIds: brewId },
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
