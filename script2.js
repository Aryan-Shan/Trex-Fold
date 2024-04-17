document.addEventListener('DOMContentLoaded', function() {
    // Focus on the iframe to make it active immediately upon page load
    var iframe = document.getElementById('game-iframe');
    iframe.contentWindow.focus();


    
});

// Simulate a space bar press in the dino.html document
function Jump() {
    var dinoWindow = document.getElementById('game-iframe').contentWindow;
    dinoWindow.postMessage('simulateSpaceBarPress', '*');
}


let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
  };
function drawPoint(y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  function drawKeypoints(keypoints) {
    const keypointsArray = keypoints;
  
    for (let i = 0; i < keypointsArray.length; i++) {
      const y = keypointsArray[i][0];
      const x = keypointsArray[i][1];
      drawPoint(x - 2, y - 2, 3);
    }
  
    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
      drawPath(points, false);
    }
  }
  
  function drawPath(points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point[0], point[1]);
    }
  
    if (closePath) {
      region.closePath();
    }
    ctx.stroke(region);
  }

let video =document.getElementById('webcam-feed');
let canvas =document.getElementById('canvas');
let ctx = canvas.getContext('2d');
const setUpCamera= () => {
   if(navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video:true})
    .then(function(stream){
        video.srcObject = stream;
    })
    .catch(function(err){
        console.log(err);
    });
   }
}
setUpCamera();

const detectHands = async () => {
    const predictions = await model.estimateHands(video);
    ctx.drawImage(video, 0, 0, 400, 300);
    ctx.beginPath();
    ctx.lineWidth = '4';
    ctx.strokeStyle = 'red';
    
    predictions.forEach((prediction) => {
        drawKeypoints(prediction.landmarks);
        
        if (prediction.landmarks && prediction.landmarks.length >= 6) {
            const indexFinger = prediction.landmarks[5]; // Index finger tip
            const thumb = prediction.landmarks[4]; // Thumb tip
            
            const distance = Math.sqrt(
                Math.pow(indexFinger[0] - thumb[0], 2) +
                Math.pow(indexFinger[1] - thumb[1], 2)
            );

            //console.log("Distance between index and thumb:", distance);
            // Print the distance between the index and thumb fingers to the console for observation.

            if (distance < 20) { // Adjust this threshold as needed
                Jump();
            }
        }
    });
};

video.addEventListener('loadeddata',async () =>{
  model = await handpose.load();
  setInterval(detectHands,100);
});