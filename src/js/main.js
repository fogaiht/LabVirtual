/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

"use strict";

/* globals MediaRecorder */

var mediaSource = new MediaSource();
mediaSource.addEventListener("sourceopen", handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var gumVideo = document.querySelector("video#gum");
var recordedVideo = document.querySelector("video#recorded");

var recordButton = document.querySelector("button#record");
var playButton = document.querySelector("button#play");
var downloadButton = document.querySelector("button#download");
var downloadButton2 = document.querySelector("button#download2");

recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;
downloadButton2.onclick = download;

function DataHoje() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  var hour = today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();

  yyyy = yyyy - 2000;

  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }

  return (today =
    "Video made in " +
    dd +
    "-" +
    mm +
    "-" +
    yyyy +
    " at " +
    hour +
    "_" +
    min +
    "_" +
    sec);
}

// window.isSecureContext could be used for Chrome
// var isSecureOrigin = location.protocol === 'https:' ||
// location.hostname === 'localhost';
// if (!isSecureOrigin) {
//   alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
//     '\n\nChanging protocol to HTTPS');
//   location.protocol = 'HTTPS';
// }

var constraints = {
  audio: true,
  video: true
};

var bgcolorAUX = document.body.style.backgroundColor;

function Mudarestado(el) {
  var display = document.getElementById(el).style.display;

  if (display == "none") {
    document.getElementById(el).style.display = "block";
  } else {
    document.getElementById(el).style.display = "none";
  }
}

function LightOn(){
  document.body.style.backgroundColor = "white";
}

function LightOff(){
  document.body.style.backgroundColor = bgcolorAUX;
}

function EscondeVideo(el) {
  var display = document.getElementById(el).style.display;

  if (display == "block") {
    document.getElementById(el).style.display = "none";
  } else {
    document.getElementById(el).style.display = "none";
  }
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log("getUserMedia() got stream: ", stream);
  window.stream = stream;
  gumVideo.srcObject = stream;
}

function handleError(error) {
  console.log("navigator.getUserMedia error: ", error);
}

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(handleSuccess)
  .catch(handleError);

function handleSourceOpen(event) {
  console.log("MediaSource opened");
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log("Source buffer: ", sourceBuffer);
}

recordedVideo.addEventListener(
  "error",
  function(ev) {
    console.error("MediaRecording.recordedMedia.error()");
    alert(
      "Your browser can not play\n\n" +
        recordedVideo.src +
        "\n\n media clip. event: " +
        JSON.stringify(ev)
    );
  },
  true
);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log("Recorder stopped: ", event);
}

function toggleRecording() {
  if (recordButton.textContent === "Start") {
    startRecording();
    EscondeVideo("videoRecorded");
    EscondeVideo("jumbo");
    LightOn();
  } else {
    stopRecording();
    recordButton.textContent = "Start";
    playButton.disabled = false;
    downloadButton.disabled = false;
    EscondeVideo("videoRecorded");
    EscondeVideo("jumbo");
    LightOn();
  }
}

function startRecording() {
  recordedBlobs = [];
  var options = { mimeType: "video/webm;codecs=vp9" };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + " is not Supported");
    options = { mimeType: "video/webm;codecs=vp8" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + " is not Supported");
      options = { mimeType: "video/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + " is not Supported");
        options = { mimeType: "" };
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error("Exception while creating MediaRecorder: " + e);
    alert(
      "Exception while creating MediaRecorder: " +
        e +
        ". mimeType: " +
        options.mimeType
    );
    return;
  }
  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  recordButton.textContent = "Stop";
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log("MediaRecorder started", mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log("Recorded Blobs: ", recordedBlobs);
  recordedVideo.controls = true;  
}

function play() {
  var superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  // var url=recordedVideo.getAttribute('src'); //Usado para abrir em outra aba
  // window.open(url); 
  // recordedVideo.play();  //Iniciar o Vídeo
  Mudarestado("videoRecorded");
  Mudarestado("jumbo");
  window.scrollTo(0,document.body.scrollHeight);
  LightOff();
}

function download() {
  var blob = new Blob(recordedBlobs, { type: "video/webm" });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");

  a.style.display = "none";
  a.href = url;
  a.download = DataHoje();
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
