const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('./config.js');
const zlib = require('zlib');

let s3Client;

const awsS3Helpers = {
	s3Client : s3Client,
	active   : false,
	init     : async ()=>{
		if(config.get('enable_s3') && config.get('s3_bucket')) {
			this.s3Check();
		}
	},
	s3Active : ()=>{ return this.active; },
	s3Check  : async ()=>{
		this.s3Client = new S3Client({
			region      : process.env.AWS_REGION,
			credentials : {
				accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
			}
		});

		const checkForFiles = new ListObjectsV2Command({
			Bucket : config.get('s3_bucket'),
		});

		try {
			const { Contents, IsTruncated, NextContinuationToken } = await this.s3Client.send(checkForFiles);
			// We don't care about the results, just that it doesn't throw an exception.
			this.active = true;
		} catch (err){
			console.error(`Unable to connect to S3 as expected.`);
			console.error(err);
			this.active = false;
		}
	},
	s3GetText : async(id)=>{
		if(this.active) {
			const getCommand = new GetObjectCommand({
				Bucket : config.get('s3_bucket'),
				Key    : id
			});
			try {
				const response = await this.s3Client.send(getCommand);
				const results = await response.Body.transformToString();
				return results;
			} catch (err) {
				console.error(`Unable to retrieve ${id} from bucket ${config.get('s3_bucket')}.`);
				console.error(err);
				return undefined;
			}
		}
		return false;
	},
	s3PutText : async(id, brewObjectText)=>{
		if(this.active) {
			const putCommand = new PutObjectCommand({
				Bucket : config.get('s3_bucket'),
				Key    : id,
				Body   : brewObjectText
			});
			try {
				const response = await this.s3Client.send(putCommand);
				return true;
			} catch (err) {
				console.error(`Unable to write ${id} to ${config.get('s3_bucket')}.`);
				console.error(err);
				return false;
			}
		}
		return false;
	}
};

if(config.get('enable_s3')) {
	awsS3Helpers.activeS3 = awsS3Helpers.s3Check();
}


module.exports = awsS3Helpers;