const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
var S3Encript = require('node-s3-encryption-client');

const sampleJson = {
    "glossary": {
        "title": "example glossary",
        "GlossDiv": {
            "title": "S",
            "GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
                    "SortAs": "SGML",
                    "GlossTerm": "Standard Generalized Markup Language",
                    "Acronym": "SGML",
                    "Abbrev": "ISO 8879:1986",
                    "GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
                        "GlossSeeAlso": ["GML", "XML"]
                    },
                    "GlossSee": "markup"
                }
            }
        }
    }
}
const putObjBody = JSON.stringify(sampleJson);

const bucketName = 'cup-central-local-ltigw';
const bucketKeyForEncryptedData = 'test-manoj/encrypted.txt'
const bucketKeyForPlainData = 'test-manoj/plain.txt'

async function s3PutObjectWithEncryption() {
    return new Promise((resolve) => {
        var putParams = {
            Bucket: bucketName,
            Key: bucketKeyForEncryptedData,
            Body: putObjBody,
            KmsParams: {
                KeyId: 'arn:aws:kms:ap-south-1:003801200385:alias/test_envelope_enc',
                KeySpec: "AES_256",
                EncryptionContext: {
                    'company': 'compro'
                },
            }
        }
        const t1 = Date.now();
        S3Encript.putObject(putParams, function (err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log(`s3PutObjectWithEncryption,${Date.now() - t1}`);
                resolve(data);
            }
        });
    });
}

async function s3PutObjectWithoutEncryption() {
    const params = {
        Bucket: bucketName,
        Key: bucketKeyForPlainData,
        Body: putObjBody
    };
    const t1 = Date.now();
    try {
        await new AWS.S3().putObject(params).promise();
        console.log(`s3PutObjectWithoutEncryption,${Date.now() - t1}`);
    }
    catch (e) {
        console.log(e);
    }
}

async function s3GetObjectWithEncryption() {
    return new Promise((resolve) => {
        var getParams = {
            Bucket: bucketName,
            Key: bucketKeyForEncryptedData,
            EncryptionContext: {
                'company': 'compro'
            }
        };
        const t1 = Date.now();
        S3Encript.getObject(getParams, function (err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log(`s3GetObjectWithEncryption,${Date.now() - t1}`);
                console.log(data.Body.toString());
                resolve(data);
            }
        });
    })
}

async function s3GetObjectWithoutEncryption() {
    const params = {
        Bucket: bucketName,
        Key: bucketKeyForPlainData
    };
    const t1 = Date.now();
    const data = await new AWS.S3().getObject(params).promise().then((data) => data.Body.toString());
    console.log(`s3GetObjectWithoutEncryption,${Date.now() - t1}`);
    console.log(data);
}

let response;
exports.lambdaHandler = async (event, context) => {
    try {
        const method = event.body.method;
        switch (method) {
            case 's3PutObjectWithEncryption':
                await s3PutObjectWithEncryption();
                break;
            case 's3PutObjectWithoutEncryption':
                await s3PutObjectWithoutEncryption();
                break;
            case 's3GetObjectWithEncryption':
                await s3GetObjectWithEncryption();
                break;
            case 's3GetObjectWithoutEncryption':
                await s3GetObjectWithoutEncryption();
                break;
        }
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'success'
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
