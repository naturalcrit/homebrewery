// /server/folder.model.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { model as BrewModel } from './homebrew.model.js';


const FolderSchema = mongoose.Schema({
  author:       { type: String, required: true, index: true },
  folderId:     { type: String, required: true, index: true, unique: true, default: () => nanoid(12) },
  slug:         { type: String, required: true, trim: true, lowercase: true,
    match: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, },
  title:        { type: String, required: true, trim: true, default: 'Untitled folder', },
  shareIds:     { type: [String], default: [] },
  subFolderIds: { type: [String], default: [] },
  isPublished:  { type: Boolean, required: true, default: false },
  isPrivate:    { type: Boolean, required: true, default: false },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
}, { versionKey: false });

/*
// Application code validates slug for syntax, and also sibling uniqueness

// Folders reference brew shareIds.

// Folders can contain sub-folders, as a DAG, not a tree
// subfolderIds contains outgoing edges in the folder DAG
// Application code prevents self-references and cycles

// No semantics implied by array order of shareIds or subfolderIds.

// isPublished determines appearance in the User's Published Brews section of their user page
// isPrivate means non-authors cannot view the folder even if they have the url

// updatedAt is managed in the app.
*/

// Error codes ...........................................................

export const folderApiErrors = {
// TODO: sanity these numbers

  // constraints
  '100': `Folder operations require a logged in user.`,
  '101': `A folder with this identifier already exists.`,
  '102': `A bookmarks folder already exists.`,
  '103': `A favorites folder already exists.`,

  '110': `An error occurred trying to find folders for the user.`,
  '120': `The author username could not be found.`,
  '122': `One or more required fields are missing from the request.`,
  '124': `One or more fields are values of the wrong type.`,

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

  '115': `An error occurred while adding brew to folder.`,
  '116': `An error occurred while removing brew from folder.`,
  '117': `An error occurred while retrieving the folder.`,

  // validation
  '121': `Folder slug is not valid.`,
  '123': `Folder slug is already in use in one or more locations containing this folder.`,
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

function throwFolderError(err, code, fields = []) {
  const error = new Error();
  error.HBErrorCode = err.HBErrorCode || code;
  error.name = 'FolderAccess Error';
  error.message = folderApiErrors[error.HBErrorCode];
  error.cause = err;

  const fieldNames = Array.isArray(fields) ? fields : fields.split();
  if ( fieldNames.length ) {
    error['invalid-params'] = fieldNames.map((name) => ({
      name,
      reason: 'Must not be null or blank',
    }));
  }

  // NOTE1: Error objects are not normally serialisable
  // NOTE2: Stack traces shouldn't normally get passed back to external callers
  // TODO: Remove cause details from API responses after debugging.
  error.toJSON = function () {
    return {
      HBErrorCode: this.HBErrorCode,
      name: this.name,
      message: this.message,
      cause: this.cause && {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      },
      'invalid-params': this['invalid-params'],
    };
  };

  throw error;
}

// Folder operations .........................................................

FolderSchema.statics.getByUser = async function(author, ownAccount) {
  try {

    if ( author === null || author.trim() === '')
      throwFolderError(err, '122', 'author');

    // NOTE: not testing if author exists to avoid enumeration

    const query = { author: author };

    if(!ownAccount) {
      query.isPublished = true;
      query.isPrivate = false;
    }

    const folders = await this.find(query)
      .select( 'author folderId slug title shareIds subFolderIds isPublished isPrivate' )
      .lean();
    // NOTE: null == empty set, not an error

    return folders;
  }
  catch (err) {
    throwFolderError(err, '110');
  }
};


FolderSchema.statics.getById = async function(author, folderId, ownAccount=false) {
  // returns folder document
  try {
    const query = {
      author: (author ?? '').trim(),
      folderId,
    };

    if(!ownAccount) {
      query.isPublished = true;
      query.isPrivate = false;
    }

    const folder = await this.findOne(query)
      .select( 'author folderId slug title shareIds subFolderIds isPublished isPrivate' )
      .lean();

    // null is not normally an error
    // here though it should be .. the caller has an id, it should exist
    if (!folder) {
      const err = new Error();
      err.HBErrorCode = '104';
      throw err;
    }

    return folder;
  }
  catch (err) {
    throwFolderError(err, '117');
  }
};


FolderSchema.statics.createFolder = async function(
  author,
  { title, slug, isPublished, isPrivate }
) {
  try {
    // normalise user inputs
    title = (title ?? '').replace(/\s+/gu, ' ').trim() || 'Untitled folder';
    slug = slugify(slug || title);
    isPublished = isPublished ?? false;
    isPrivate = isPrivate ?? true;

    // throw if slug invalid, e.g. ''
    if (slug == '') {
      const err = new Error();
      err.HBErrorCode = '121';
      err.fields = ['slug'];
      throw err;
    }

    // TODO: throw if slug not unique within parent folder [TRICKY]
    // TODO: LATER: throw if parentId provided but folder not found - before or after creating folder?

    const folder = new this(
      { author, title, slug, isPublished, isPrivate, },
      { strict: "throw" }
    );

    await folder.save();

    // TODO: accept parent folderId, add folder.folderId to parent.subFolderIds[]

    return folder;
  }
  catch(err) {
    throwFolderError(err, '105');
  }
};


FolderSchema.statics.updateFolder = async function(
  author,
  folderId,
  { title, slug, isPublished, isPrivate } = {}
) {
  try {
    // normalise user inputs
    title = (title ?? '').replace(/\s+/gu, ' ').trim() || 'Untitled folder';
    slug = slug === undefined ? undefined : slugify(slug || title);

    // throw if slug invalid, e.g. ''
    if (slug !== undefined && slug === '') {
      const err = new Error();
      err.HBErrorCode = '121';
      throw err;
    }

    // throw if slug already present in any parent folder
    const slugCollision = false;
    // TODO: actually test for collision
    if (slug !== undefined && slugCollision) {
      const err = new Error();
      err.HBErrorCode = '123';
      throw err;
    }

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

    let folder;
    if (Object.keys(updates).length === 0) {
      folder = this.findOne({ author, folderId });
    }
    else {
      folder = await this.findOneAndUpdate(
        { author, folderId },
        { $set: updates },
        { new: true },
      );
    }

    // Folder doesn't exist?
    // null indicates an error here
    if (!folder) {
      const err = new Error();
      err.HBErrorCode = '106';
      throw err;
    }

    return folder;
  }
  catch (err) {
    throwFolderError(err, '108');
  }
};


FolderSchema.statics.deleteFolder = async function(author, folderId) {
  try {
    // TODO: remove dangling references to this folderId?
    // not essential, just tidy.
    // not needed at all until we have nested folders.

    const result = await this.deleteOne({ author, folderId });

    if (result.deletedCount === 0) {
      const err = new Error();
      err.HBErrorCode = '107';
      throw err;
    }

    return result;
  }
  catch (err) {
    throwFolderError(err, '109');
  }
};


FolderSchema.statics.addBrewToFolder = async function( author, folderId, brewId) {
  try {
    const brewExists = await BrewModel.exists({ brewId });
    if(!brewExists) {
      const err = new Error();
      err.HBErrorCode = '112';
      throw err;
    }

    const result = await this.findOneAndUpdate(
      { author, folderId },
      {
        $addToSet: { shareIds: brewId },
        $set: { updatedAt: new Date() },
      },
      { new: true },
    );

    // nothing updated == folder not found
    if ( result === null ) {
      const err = new Error();
      err.HBErrorCode = '111';
      throw err;
    }

    return result;
  }
  catch (err) {
    throwFolderError(err, '115');
  }
};


FolderSchema.statics.removeBrewFromFolder = async function( author, folderId, brewId ) {
  // returns updated folder
  try {
    const brewExists = await BrewModel.exists({ brewId });
    if(!brewExists) {
      const err = new Error();
      err.HBErrorCode = '114';
      throw err;

      // TODO: decision:
      //
      // Suppose the brew was deleted after someone put it in a
      // folder. The folder now contains a dangling shareId.
      //
      // Trying to remove that dangling ID should arguably still
      // succeed.
    }

    const result = await this.findOneAndUpdate(
      { author, folderId },
      {
        $pull: { shareIds: brewId },
        $set: { updatedAt: new Date() },
      },
      { new: true },
    );

    // null == no folder updated because no folder found .. which is an error
    if (!result) {
      const err = new Error();
      err.HBErrorCode = '113';
      throw err;
    }

    return result;
  }
  catch (err) {
    throwFolderError(err, '116');
  }
};


// TODO: MVP+1 = add bookmarks wrappers

// TODO: MVP+n = add nesting of folders
// FolderSchema.statics.addFolderToFolder = async function( author, parentFolderId, childFolderId) ...
// FolderSchema.statics.removeFolderFromFolder = async function( author, parentFolderId, childFolderId ) ...

// ----------------------------------------------------------------------

// Now compile the model ...
const Folder = mongoose.model('Folder', FolderSchema);

export { Folder as model };
