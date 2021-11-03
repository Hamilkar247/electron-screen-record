

//Buttons 
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclink = getVideoSources;

const { desktopCapturer } = require('electron')
const { Menu } = remote;

//Obtenez les sources vidéo disponibles
////Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
          label: source.name,
          click: () => selectSource(source)
      };
    })
  );

  videoOptionsMenu.popup();
}

let mediaRecorder; //MediaRecorder instance to capture footage
const recorderdChunks = [];

async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };
  //Creat a stream
  ////Créer un flux
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //Preview the source in a video element
  ////Prévisualiser la source dans un élément vidéo 
  videoElement.srcObject = stream;
  videoElement.play();

  //Create the Media Recorder
  const options = { mimeType: 'video/webm; codec=vp9'};
  mediaRecorder = new MediaRecorder(stream, options);

  //Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handlestop;

  //Captures all recorded chunks
  function handleDataAvailable(e) {
      recorderdChunks.push(e.data);
  }
    
};

const { writeFile } = require('fs');

////Save the video file on stop
//Enregistrez le fichier vidéo à l'arrêt
async function handleStop(e) {
  const blob = new Blob(recorderdChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'SaveVideo',
    defaultPath: `vid-${Date.now()}.webm`
  });

  console.log(filePath);
  
  writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}

