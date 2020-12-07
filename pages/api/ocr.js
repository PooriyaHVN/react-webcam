import {DEV_SITE_NAME, FILE_PATH, SITE_NAME} from "../../env";
const request = require("request");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const uriBase = process.env.ENDPOINT + "vision/v3.1/ocr";
const params = {
  language: "unk",
  detectOrientation: "true",
};
export const config = {
  api: {
    bodyParser: false,
  },
};
const uniqueSuffix = Date.now() + "-";
export default (req, res) => {
  try {
    const form = formidable({
      keepExtensions: true,
      uploadDir: FILE_PATH,
    });
    new Promise((resolve, reject) => {
      form.once("error", err => reject(err));
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        if (!files.image) return reject("Please Select Image");
        fs.rename(
          `${FILE_PATH}${files.image.path.replace("public", "").replace("uploads", "")}`,
          `${FILE_PATH}/${uniqueSuffix + files.image.name}`,
          err => {
            if (err) {
              console.log(err);
              reject(err.message);
            }
            let name = (files.image.name = uniqueSuffix + files?.image.name);
            if (err) reject(err.message);
            let imageUrl = name;
            console.log(SITE_NAME + "/uploads/" + imageUrl);
            const options = {
              uri: uriBase,
              qs: params,
              body: '{"url": ' + '"' + SITE_NAME + "/uploads/" + imageUrl + '"}',
              headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTIONKEY,
              },
            };
            request.post(options, (error, response, body) => {
              if (error) {
                console.log("Error: ", error);
                reject(error);
                return;
              }
              if (response.statusCode == 200) {
                let jsonResponse = JSON.stringify(JSON.parse(body), null, "  ");
                console.log("JSON Response\n");
                console.log(jsonResponse);
                resolve(jsonResponse);
              } else reject("error from microsoft server : " + response.statusMessage);
            });
          }
        );
      });
    })
      .then(result => {
        res.send(result);
      })
      .catch(err => res.status(500).send(err));
  } catch (e) {
    console.log(e);
  }
};
