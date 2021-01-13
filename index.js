
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
var S3Encript = require('node-s3-encryption-client');

function s3PutObject(){
var putParams = {
  Bucket: 'cup-central-local-ltigw',
  Key: 'test-manoj/test1.txt',
  Body: 'hello world 2',
  KmsParams: {
    KeyId: 'arn:aws:kms:ap-south-1:003801200385:alias/test_envelope_enc',
    KeySpec: "AES_256",
    EncryptionContext: {
      'company': 'compro'
    },
  }
}
let date = new Date().getTime();
S3Encript.putObject(putParams, function (err, data) {
  let date2 = new Date().getTime();
  console.log("Put Object Time in milliseconds",date2-date);
  if (err) {
    console.log("Error", err);
  }
  if (data) {
    console.log("Upload Success");
  }
});
}
function s3GetObject(){
var getParams = {
  Bucket: 'cup-central-local-ltigw',
  Key: 'test-manoj/test1.txt',
  EncryptionContext: {
    'company': 'compro'
  }
};
let date = new Date().getTime();
S3Encript.getObject(getParams, function (err, data) {
  let date2 = new Date().getTime();
  console.log("Get Object Time in milliseconds",date2-date);
  if (err) {
    console.log("Error", err);
  }
  if (data) {
    console.log("Get Success", data.Body);
  }
})}

s3PutObject();

s3GetObject();
