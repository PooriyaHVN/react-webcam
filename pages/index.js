import React, {useRef} from "react";
import styles from "../styles/Home.module.css";
import Webcam from "react-webcam";
const async = require("async");
const https = require("https");
const path = require("path");
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient = require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const style = {
  width: "50%",
  marginBottom: "1rem",
  background: "skyBlue",
  color: "#000",
  padding: "1rem",
  border: "1px solid black",
  borderRadius: 25,
  cursor: "pointer",
  fontWeight: "bold",
  outline: "none",
};

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, {type: mime});
}

export default function Home() {
  const [webcamOn, setWebcamOn] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(null);
  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc);
    setImgSrc(dataURLtoFile(imageSrc, "image.jpg"));
  }, [webcamRef, setImgSrc]);

  const sendToApi = e => {
    e.preventDefault();
    console.log(imgSrc);
    //Usage example:
    const formData = new FormData();
    formData.append("image", imgSrc);
    fetch("/api/ocr", {
      method: "post",
      body: formData,
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className={styles.container}>
      <button style={style} onClick={() => setWebcamOn(!webcamOn)}>
        Click to {webcamOn ? "close" : "Open"} web cam
      </button>

      {webcamOn && (
        <>
          <Webcam ref={webcamRef} audio={false} height={280} ref={webcamRef} screenshotFormat="image/jpeg" width={480} />
          <button
            style={{
              width: "25%",
              marginTop: "1rem",
              background: "skyBlue",
              color: "#000",
              padding: "1rem",
              border: "1px solid black",
              borderRadius: 25,
              cursor: "pointer",
              fontWeight: "bold",
              outline: "none",
            }}
            onClick={capture}
          >
            Capture photo
          </button>
          {imgSrc && (
            <>
              <img src={imgSrc} />
            </>
          )}
        </>
      )}
      <form onSubmit={sendToApi} encType="multipart/form-data">
        <input type="file" style={{padding: "1rem", background: "#333"}} onChange={e => setImgSrc(e.target.files[0])} />
        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "1rem",
            background: "skyBlue",
            color: "#000",
            padding: "1rem",
            border: "1px solid black",
            borderRadius: 25,
            cursor: "pointer",
            fontWeight: "bold",
            outline: "none",
          }}
        >
          Send For Recognation{" "}
        </button>
      </form>
    </div>
  );
}

/*  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({
      inHeader: {"Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTIONKEY},
    }),
    process.env.ENDPOINT
  ); */
