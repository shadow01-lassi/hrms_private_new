import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';

import { config } from "dotenv"
config()


const s3 = new S3Client(
    {
        region: process.env.AWS_S3_REGION,
        credentials: fromEnv()
    }
)

const uploadFile = async (buffer: Buffer, key: string): Promise<string> => {

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'application/octet-stream',
        // ACL: ObjectCannedACL.public_read,
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        console.log('File uploaded successfully:',);
        const folder = "society";
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${key}`;
        console.log(url);
        return url;
    } catch (error) {
        console.error('Error uploading file:', error);
        return "";
    }
};

export { uploadFile };