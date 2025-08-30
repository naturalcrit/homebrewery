/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const _ = require('lodash');
const createClass = require('create-react-class');
import {makePatches, applyPatches, stringifyPatches, parsePatches} from '@sanity/diff-match-patch';
import { md5 } from 'hash-wasm';
import { gzipSync, strToU8 } from 'fflate';

import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');

const BaseEditPage = require('../basePages/editPage/editPage.jsx');

const LockNotification = require('./lockNotification/lockNotification.jsx');

import Markdown from 'naturalcrit/markdown.js';

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

const googleDriveIcon = require('../../googleDrive.svg');


const EditPage = createClass({
	displayName     : 'EditPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
		};
	},

	getInitialState : function() {
		return {
			alertTrashedGoogleBrew     : this.props.brew.trashed,
			alertLoginToTransfer       : false,
			saveGoogle                 : this.props.brew.googleId ? true : false,
			confirmGoogleTransfer      : false,
			error                      : null,
			displayLockMessage         : this.props.brew.lock || false,
		};
	},

	componentDidMount : function(){

	},

	handleGoogleClick : function(){
		if(!global.account?.googleId) {
			this.setState({
				alertLoginToTransfer : true
			});
			return;
		}
		this.setState((prevState)=>({
			confirmGoogleTransfer : !prevState.confirmGoogleTransfer,
			error                 : null
		}));

	},

	closeAlerts : function(event){
		event.stopPropagation();	//Only handle click once so alert doesn't reopen
		this.setState({
			alertTrashedGoogleBrew : false,
			alertLoginToTransfer   : false,
			confirmGoogleTransfer  : false
		});
	},

	toggleGoogleStorage : function(){
		this.setState((prevState)=>({
			saveGoogle : !prevState.saveGoogle,
			error      : null
		}), ()=>this.trySave(true));
	},

	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		const brewState       = this.state.brew; // freeze the current state
		const preSaveSnapshot = { ...brewState };

		this.setState((prevState)=>({
			isSaving   : true,
			error      : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		await updateHistory(this.state.brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		//Prepare content to send to server
		const brew          = { ...brewState };
		brew.text           = brew.text.normalize('NFC');
		this.savedBrew.text = this.savedBrew.text.normalize('NFC');
		brew.pageCount      = ((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;
		brew.patches        = stringifyPatches(makePatches(encodeURI(this.savedBrew.text), encodeURI(brew.text)));
		brew.hash           = await md5(this.savedBrew.text);
		//brew.text           = undefined; - Temporary parallel path
		brew.textBin        = undefined;

		const compressedBrew = gzipSync(strToU8(JSON.stringify(brew)));

		const transfer = this.state.saveGoogle == _.isNil(this.state.brew.googleId);
		const params = `${transfer ? `?${this.state.saveGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : ''}`;
		const res = await request
			.put(`/api/update/${brew.editId}${params}`)
			.set('Content-Encoding', 'gzip')
			.set('Content-Type', 'application/json')
			.send(compressedBrew)
			.catch((err)=>{
				console.log('Error Updating Local Brew');
				this.setState({ error: err });
			});
		if(!res) return;

		this.savedBrew = {
			...preSaveSnapshot,
			googleId : res.body.googleId ? res.body.googleId : null,
			editId 	 : res.body.editId,
			shareId  : res.body.shareId,
			version  : res.body.version
		};

		this.setState((prevState) => ({
			brew: {
				...prevState.brew,
				googleId : res.body.googleId ? res.body.googleId : null,
				editId 	 : res.body.editId,
				shareId  : res.body.shareId,
				version  : res.body.version
			},
			isSaving    : false,
		}), ()=>{
			this.setState({ unsavedChanges : this.hasChanges() });
		});

		history.replaceState(null, null, `/edit/${this.savedBrew.editId}`);
	},

	renderGoogleDriveIcon : function(){
		return <Nav.item className='googleDriveStorage' onClick={this.handleGoogleClick}>
			<img src={googleDriveIcon} className={this.state.saveGoogle ? '' : 'inactive'} alt='Google Drive icon'/>

			{this.state.confirmGoogleTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					{ this.state.saveGoogle
						?	`Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?`
						: `Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?`
					}
					<br />
					<div className='confirm' onClick={this.toggleGoogleStorage}>
						Yes
					</div>
					<div className='deny'>
						No
					</div>
				</div>
			}

			{this.state.alertLoginToTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					You must be signed in to a Google account to transfer
					between the homebrewery and Google Drive!
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${window.Location.href}`}>
						<div className='confirm'>
							Sign In
						</div>
					</a>
					<div className='deny'>
						Not Now
					</div>
				</div>
			}

			{this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			}
		</Nav.item>;
	},

	processShareId : function() {
		return this.state.brew.googleId && !this.state.brew.stubbed ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	},

	getRedditLink : function(){
		const shareLink = this.processShareId();
		const systems = this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](${global.config.baseUrl}/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title.toWellFormed())}&text=${encodeURIComponent(text)}`;
	},

	renderNavbar : function(){
		const shareLink = this.processShareId();

		return <>
			<Nav.section>
				{this.renderGoogleDriveIcon()}
				<Nav.dropdown>
					<Nav.item color='teal' icon='fas fa-share-alt'>
						share
					</Nav.item>
					<Nav.item color='blue' href={`/share/${shareLink}`}>
						view
					</Nav.item>
					<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${shareLink}`);}}>
						copy url
					</Nav.item>
					<Nav.item color='blue' href={this.getRedditLink()} newTab={true} rel='noopener noreferrer'>
						post to reddit
					</Nav.item>
				</Nav.dropdown>
			</Nav.section>
		</>;
	},

	render : function(){
		return  <BaseEditPage
							className="editPage"
							errorState={this.state.error}
							parent={this}
							brew={this.state.brew}
							renderUniqueNav={this.renderNavbar}
							performSave={this.save}
							recentStorageKey='edit'>
							{(welcomeText, brew, save) => {
								return <>
									<Meta name='robots' content='noindex, nofollow' />
									{this.props.brew.lock && <LockNotification shareId={brew.shareId} message={brew.lock.editMessage} reviewRequested={brew.lock.reviewRequested} />}
								</>
							}}
						</BaseEditPage>;
	}
});

module.exports = EditPage;
