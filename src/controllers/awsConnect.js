const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: "AKIAR7VN4HY7UGJZDEE2",
  secretAccessKey: "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",
  region:"ap-south-1"
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "bucketwala",
      Key: "me/" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};

module.exports = { uploadFile };
