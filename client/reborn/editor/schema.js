// PM schema, computed from the block registry.
//
// Wave 4: there is no per-block-type code in this file. Every node spec and
// every mark spec comes from `../blocks/registry.js`. Adding a block type
// does not touch this file.

import { Schema } from 'prosemirror-model';
import { pmSchemaSpec } from '../blocks/registry.js';

export const schema = new Schema(pmSchemaSpec);
