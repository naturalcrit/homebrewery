const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('./config.js');
const zlib = require('zlib');

let s3Client;
let s3Active = false;

const awsS3Helpers = {
	s3Active : ()=>{ return s3Active; },
	s3Check  : async (client)=>{

		const checkForFiles = new ListObjectsV2Command({
			Bucket : config.get('s3_bucket'),
		});

		try {
			const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(checkForFiles);
			// We don't care about the results, just that it doesn't throw an exception.
			s3Active = true;
		} catch (err){
			console.error(`Unable to connect to S3 as expected.`);
			console.error(err);
			s3Active = false;
		}
	},
	s3GetText : async(id)=>{
		if(s3Active) {
			const getCommand = new GetObjectCommand({
				Bucket : config.get('s3_bucket'),
				Key    : id
			});
			try {
				const response = await s3Client.send(getCommand);
				const results = await response.Body.transformToByteArray();
				unzipped = zlib.inflateRawSync(Buffer.from(results)).toString();
				return unzipped;
			} catch (err) {
				console.error(`Unable to retrieve ${id} from bucket ${config.get('s3_bucket')}.`);
				console.error(err);
				return undefined;
			}
		}
		return false;
	},
	s3PutText : async(id, brewObjectText)=>{
		if(s3Active) {
			const putCommand = new PutObjectCommand({
				Bucket : config.get('s3_bucket'),
				Key    : id,
				Body   : brewObjectText
			});
			try {
				const response = await s3Client.send(putCommand);
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

if(config.get('enable_s3') && config.get('s3_bucket')) {
	s3Client = new S3Client({
		region      : process.env.AWS_REGION,
		credentials : {
			accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
		}
	});
	awsS3Helpers.activeS3 = awsS3Helpers.s3Check(s3Client);
}

module.exports = awsS3Helpers;