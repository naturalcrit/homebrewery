const _ = require('lodash');
const UserInfoModel = require('./userinfo.model.js').model;
const router = require('express').Router();


const updateUserActivity = async (req, res)=>{
	username = req.account?.username;
	if(username) {
		await UserInfoModel.updateActivity(username);
	}
	return res.status(200).send();
};

const getUserOpts = async (req, res)=>{
	console.log(req.account?.username);
	username = req.account?.username;

	if(username) {
		const userOpts = await UserInfoModel.getUserOpts(username);
		console.log(userOpts);
		return res.status(200).send(userOpts);
	}
};

router.get('/userinfo/updateActivity', updateUserActivity);
router.get('/userinfo/getUserOpts', getUserOpts);

module.exports = router;
