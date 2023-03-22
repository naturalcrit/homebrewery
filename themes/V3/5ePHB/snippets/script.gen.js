const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = {
	dwarvish : ()=>{
		return dedent `##### Dwarvish Runes: Sample Alphabet
            {{runeTable,wide,frame,font-family:Davek
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            :
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            }}\n\n`;
	},
	elvish : ()=>{
		return dedent `##### Elvish Runes: Sample Alphabet
            {{runeTable,wide,frame,font-family:Rellanic
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            :
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            }}\n\n`;
	},
	draconic : ()=>{
		return dedent `##### Draconic Runes: Sample Alphabet
            {{runeTable,wide,frame,font-family:Iokharic
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | a | b | c | d | e | f | g | h | i | j | k | l | m |
            :
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
            | n | o | p | q | r | s | t | u | v | w | x | y | z |
            }}\n\n`;
	}


};


()=>{

};
