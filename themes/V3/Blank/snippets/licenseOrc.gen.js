/* eslint-disable max-lines */
const _ = require('lodash');

module.exports = {

	orc1 : function () {
		return `
{{license,wide

### ORC LICENSE [INTERIM]

This Open RPG Creative license (“ORC License”) grants the right to use Licensed Material subject to the
terms and conditions set forth and referenced as follows:

:

**I. Definitions.**

- **Adapted Licensed Material**: Means Derivative Works that Use all or any portion of the Licensed Material that You create or publish to the limited extent that such Derivative Works would otherwise constitute those forms of Licensed Material set forth in Section I.e.(2) below. Adapted Licensed Material expressly excludes works that would constitute Reserved Material.
- **Copyright and Similar Rights**: Means copyright and/or similar rights closely related to copyright including, without limitation, performance, broadcast, sound recording, and Sui Generis Database Rights, without regard to how the rights are labeled or categorized. In no event shall Copyright and Similar Rights include trademark or patent rights.
- **Derivative Work**: Means:

{{padding-left:2em

**(i)**:: for a product that Uses a single playable game system, the entire product published by or on behalf of You that is based on, derived from, or incorporates all or any portion of the Licensed Material; and 

**(ii)**:: for products containing sections relating to multiple non-interoperable game systems (such as a magazine featuring sections regarding multiple unrelated games from different publishers or a website with portions related to different games) the entire portion of the product related to or derived from the Licensed Material shall constitute the Derivative Work.

}}

:
  
- **Effective Technological Measures**: Means those measures that, in the absence of proper authority, may not be circumvented under laws fulfilling obligations under Article 11 of the WIPO Copyright Treaty adopted on December 20, 1996, and/or similar international agreements.

- **Licensed Material**: Means (1) any material contained in a Work that would otherwise constitute Reserved Material but that has been expressly designated as Licensed Material by that material’s Licensor, and (2) those expressions reasonably necessary to convey functional ideas and methods of operation of a game that are contained in a Work that are comprised of systems, procedures, processes, rules, laws, instructions, heuristics, routines, functional elements, commands, structures, principles, methodologies, operations, devices, and concepts of play, and the limitations, restraints, constraints, allowances, and affordances inherent in gameplay, including but not limited to expressions describing the function of or providing instructions as to the following:

{{padding-left:2em

**i.**:: Creation and play of player and non-player characters (such as statistics, attributes, statblocks, traits, classes, jobs, alignments, professions, proficiencies, abilities, spells, skills, actions, reactions, interactions, resources, and equipment);
  
**ii.**:: Systems and classifications applicable to gameplay (such as alignments, backgrounds, classes, experience points, levels and leveling up, encounters, combat, initiative and turn order, movement, monster statistics, creature types, traps, conditions, buffs and debuffs, powers, terrain types, challenge ratings, moves, difficulty classes, skill checks, saving throws, resting and resource management, classification of magic systems, spell and ability effects, looting, items and equipment, diplomacy systems, dialogue options, and outcome determination);

**iii.**:: Methods of determining success, failure, or outcome, and any expressions of such methods or of such successes, failures, or outcomes; and

**iv.**:: Methods and mediums by which players play the game (such as dice rolling, random number generation, coin flipping, card drawing and play, applying modifiers to results of chance, creating or filling in character sheets, moving and interacting with tokens or figurines, drawing maps and illustrations, speaking, messaging, acting, pantomime, writing notes, asking questions, and making statements).

}}

The term Licensed Material shall in no event include Third Party Reserved Material. For the avoidance of doubt, the term Licensed Material is intended to exclude Reserved Material except to the limited extent a Licensor has expressly designated content that would otherwise constitute their Reserved Material as Licensed Material pursuant to notice published under Article III.

- **Licensed Rights**: Means the rights granted to You subject to the terms and conditions of this ORC License, which are limited to all Copyright and Similar Rights that apply to Your Use of the Licensed Material and that the Licensor has authority to license.
- **Licensor**: Means any individual or entity granting rights under this ORC License.

}}

\\page
{{license,wide

- **Reserved Material**: Means trademarks, trade dress, and creative expressions that are not essential to, or can be varied without altering, the ideas or methods of operation of a game system, including works of visual art, music and sound design, and clearly expressed and sufficiently delineated characters, character organizations, dialogue, settings, locations, worlds, plots, or storylines, including proper nouns and the adjectives, names, and titles derived from proper nouns. The term Reserved Material shall in no event include elements that have been previously expressly designated as Licensed Material by that material’s Licensor, that are Adapted Licensed Material, that constitute Third Party Reserved Material, or that are in the public domain.
- **Sui Generis Database Rights**: Means rights other than copyright resulting from Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996 on the legal protection of databases, as amended and/or succeeded, as well as other essentially equivalent rights anywhere in the world.
- **Term**: Means the longer of the term of the Copyright and Similar Rights licensed herein.
- **Third Party Reserved Material**: Means all intellectual property rights that are not or have not been licensed under the ORC License and that are neither owned nor controlled by Licensor or You or any person or entity that directly or indirectly controls, is controlled by, or is under common control with You or Licensor.
- **Use or Used**: Means to use material by any means or process that requires permission under the Licensed Rights, such as production, reproduction, creation of derivative works, public display, public performance, distribution, dissemination, communication, or importation, and to make material available to the public including in ways that members of the public may access the material from a place and at a time individually chosen by them.
- **Work or Works**: Means that where a Licensor applies notice substantially in the form described in Section III to a product, (i) for products containing a single playable game, the entire product published by Licensor shall constitute the Work, and (ii) for products containing sections relating to multiple non-interoperable games (such as a magazine featuring sections regarding multiple unrelated games from different publishers or a website with portions related to different games) the entire portion of the product related to or derived from the Licensed Material shall constitute the Work.
- **You or Your**: Means the individual or entity exercising rights granted under this ORC License.

:

**II. Grants & Limitations.**

- **Primary Grant to You**: Subject to the terms and conditions of this ORC License, for the Term Licensor hereby grants You a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise the Licensed Rights in the Licensed Material to Use the Licensed Material, in whole or in part that may be terminated only as set forth in Section V.a. for Your breach. Licensor hereby authorizes You to exercise the Licensed Rights in all media and formats whether now known or hereafter created, and to make technical modifications necessary to do so. Licensor hereby waives and/or agrees not to assert any right or authority to forbid You from making technical modifications necessary to exercise the Licensed Rights, including technical modifications necessary to circumvent Effective Technological Measures.
- **Grant of Adapted Licensed Material by You**: You hereby receive an offer from the Licensor to exercise the Licensed Rights on the express condition that You do and hereby grant to every recipient of the Adapted Licensed Material an irrevocable offer to exercise the Licensed Rights in the Adapted Licensed Material under the terms and conditions hereof pursuant to which such Adapted Licensed Material shall be licensed as Licensed Material to such recipient. You may not offer or impose any additional or different terms or conditions on the Licensed Material or apply any Effective Technological Measures to the Licensed Material if doing so restricts exercise of the Licensed Rights by any recipient of the Licensed Material.
- **Database Rights**: Where the Licensed Rights include Sui Generis Database Rights that apply to Your Use of the Licensed Material, this ORC License grants You the right to extract, reuse, reproduce, and Use all or a substantial portion of the contents of the database, and if You include all or a substantial portion of the database contents in a database in which You have Sui Generis Database Rights, then the database in which You have Sui Generis Database Rights (but not its individual contents) shall constitute Adapted Licensed Material.
- **Limitations**:
  i. Nothing in this ORC License constitutes or may be construed as permission to assert or imply that You are, or that Your Use of the Licensed Material is, connected with, or sponsored, endorsed, or granted official status by, the Licensor or others designated to receive attribution hereunder.
  ii. Moral rights, such as the right of integrity, are not licensed under this ORC License, nor are publicity, privacy, and/or other similar personality rights; however, to the extent possible, the Licensor waives and/or agrees not to assert any such rights held by the Licensor to the limited extent necessary to allow You to exercise the Licensed Rights, but not otherwise.
  iii. To the extent possible, the Licensor waives any right to collect royalties from You for the exercise of the Licensed Rights and Use of the Licensed Material, whether directly or through a collecting society under any voluntary or waivable statutory or compulsory licensing scheme.


}}
\\page

{{license,wide

**III. Required Notice.**

:

The grant of this ORC License to You is expressly conditioned on You including the notice statements described in subsections (a)–(d) below in a reasonable manner based on the medium, means, and context in which You Used the Licensed Material:

- **ORC Notice**: The following statement designating the location and the terms of this ORC License:
This product is licensed under the ORC License located at the Library of Congress at TX00[number TBD] and available online at various locations. All warranties are disclaimed as set forth therein.

vbnet
Copy code

- **Attribution Notice**:
i. A statement based on reasonable, good-faith efforts that identifies each Licensor or creator of the Licensed Material You Used and any others designated to receive attribution, including all upstream licensors of Licensed Material upon which Your Adapted Licensed Material is based or derived from, worded in any accurate and reasonable manner so requested by such parties. Such credit may be named, anonymous, or a reasonable pseudonym. For the avoidance of doubt, both Licensor and all parties similarly credited under Licensor’s attribution notice should be included in Your attribution notice unless otherwise reasonably indicated by such parties.
ii. A statement indicating how You wish to be reasonably credited with respect to the Adapted Licensed Material licensed by You under this ORC License, including anonymously or by pseudonym if designated. Licensors and creators may update their name, anonymity designation, or pseudonym from time-to-time by notice to You and other known licensees hereunder; however, such change shall in no event require You to halt distribution of any Works You have produced or destroy any produced Works or Works-in-progress, but shall merely require You to use good faith efforts to implement the requested change on a going forward basis.

- **Reserved Material Notice**: A statement based on reasonable, good-faith efforts that identifies the elements of Your Reserved Material, if any, contained in the Derivative Work in which You Use the Licensed Material. For avoidance of doubt, such designation neither limits Your rights in Your Reserved Material nor limits any downstream licensee’s Use of the Adapted Licensed Material. In the event of a conflict between Your designation of Reserved Material and the definition of Licensed Material, the definition shall control.

- **Expressly Designated Licensed Material**: A statement that identifies any elements of Your content that would otherwise constitute Reserved Material contained in Your Derivative Work that You agree to offer to prospective licensees under the ORC License as Licensed Material pursuant to Section I.e.(1) above.

- **Sample Notice**: By way of example only, the following notice would comply with the requirements of this ORC License:
- **ORC Notice:** This product is licensed under the ORC License located at the Library of Congress at TX00[number TBD] and available online at various locations including [possible domain names may be inserted] and others. All warranties are disclaimed as set forth therein.

- **Attribution:** This product is based on the following Licensed Material: [Title of Work], [Copyright Notice], [Author Credit Information]. [Title of Additional Work], [Copyright Notice], [Author Credit Information], [Etc.]. If you use our Licensed Material in your own published works, please credit us as follows: [Title of This Work], [Copyright Notice], [Your Author Credit Information].

- **Reserved Material:** Reserved Material elements in this product include, but may not be limited to: The Skeleton Krew, The Horrible Nation of Funeralia, The Order of Ossuaries & Edgelords, and all elements designated as Reserved Material under the ORC License.

- **Expressly Designated Licensed Material:** The following elements are owned by the Licensor and would otherwise constitute Reserved Material and are hereby designated as Licensed Material: The Bardic Order of the Singing Skull and associated characters, locations, and titles.

:

**IV. Warranty & Limitation of Liability.**

:

Licensor warrants, represents, acknowledges, and agrees that upon publication of Required Notice in a Licensor Work, Licensor may not thereafter withdraw, modify, or revoke such offer to license the Licensed Material hereunder as to any existing licensee or any prospective licensee, and Licensor’s offer to license such Licensed Material is irrevocable. Licensor licenses the Licensed Material as-is and as-available, and makes no representations or warranties of any kind concerning the Licensed Material, whether express, implied, statutory, or other. This includes, without limitation, warranties of title, merchantability, fitness for a particular purpose, non-infringement, absence of latent or other defects, accuracy, or the presence or absence of errors, whether or not known or discoverable. Where disclaimers of warranties are not allowed in full or in part, this disclaimer may not apply to You. To the extent possible, in no event will the Licensor be liable to You on any legal theory (including, without limitation, negligence) or otherwise for any direct, special, indirect, incidental, consequential, punitive, exemplary, or other losses, costs, expenses, or damages arising out of this ORC License or use of the Licensed Material, even if the Licensor has been advised of the possibility of such losses, costs, expenses, or damages.

}}
\\page
{{license,wide

Where a limitation of liability is not allowed in full or in part, this limitation may not apply to You. The disclaimer of warranties and limitation of liability provided above shall be interpreted in a manner that, to the extent possible, most closely approximates an absolute disclaimer and waiver of all liability.

:

**V. Other Terms & Conditions.**

- **Termination & Remedies**: Your license to Use the Licensed Material will terminate automatically if You fail to comply with the terms and condition of this ORC License. Your license will be reinstated, effective as of the date of termination, if You cure such violation on a going forward basis (without the obligation to destroy inventory on hand) within 60 days of Your discovery of the violation or if Licensor waives such violation in writing. No such termination shall affect, limit, or disrupt the rights of any Licensor or downstream licensee of any Licensed Material under any ORC License. Only the Licensor and Licensor’s upstream licensors under this ORC License (which You are deemed to be in privity herewith) may bring enforcement action against You hereunder. This constitutes a limitation on Licensor remedies with respect to the license grant in the Licensed Material hereunder; however, this ORC License neither limits Licensor’s remedies in any way with respect to Licensor’s Reserved Material, nor does it limit Licensor’s right to offer the Licensed Material or Reserved Material under separate terms or conditions.
- **Modifications**: This ORC License may not be amended, superseded, modified, updated, repealed, revoked, or deauthorized. Neither You nor Licensor may modify the terms of this ORC License; however, You may enter into a separate agreement of Your own making provided such agreement does not seek to modify the terms hereof. This ORC License does not, and shall not be interpreted to reduce, limit, restrict, or impose conditions on any use of the Licensed Material that could lawfully be made without permission under this ORC License.
- **Construction**: This ORC License is published simultaneously with an answers and explanations document (“AxE”) that is filed under the same US Copyright registration as this ORC License. One purpose of the AxE is to provide a general indication of the drafters’ intentions in interpreting the ORC License and in the event of a dispute, the AxE is intended to be admissible to and used by any adjudicating body for such purpose. The ORC License may be translated into other languages. You and Licensor acknowledge and agree that if there is any conflict between this ORC License, the AxE, and such translated version, the terms of the English language ORC License registered by Azora Law PLLC with the US Copyright Office shall control. Subsequent versions of the AxE shall not be admissible for purposes of determining the drafters’ intentions with respect to the ORC License. To the extent possible, if any provision of this ORC License is deemed unenforceable by a court of law, it shall be automatically reformed to the minimum extent necessary to make it enforceable on a case-by-case basis. If such provision cannot be reformed, it shall be severed from this ORC License without affecting the enforceability of the remaining terms and conditions. No term or condition of this ORC License will be waived and no failure to comply consented to unless expressly agreed to by the Licensor. Nothing in this ORC License constitutes or may be interpreted as a limitation upon, or waiver of, any privileges and immunities that apply to the Licensor or You, including from the legal processes of any jurisdiction or authority.
}}
      `;
	},
}