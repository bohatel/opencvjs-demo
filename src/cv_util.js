
function OpenCVUitl(inputId, outputId, readCallback) {
  this.canvasId = inputId;
  this.outputCanvasId = outputId;
  this.threshold = -1;
  this.sizeThreshold = 50;
  this.imgLoaded = false;
  this.selectedShapes = [];
  this.filteredShapes = [];
  this.selectCallback = null;
  this.cvReady = false;
  this.readyCallback = readCallback;
  
  if(this.readyCallback){
    this.readyCallback(false);
  }
  if(cv.getBuildInformation) {
    this.onInit();
  } else {
    cv['onRuntimeInitialized']=()=>{
      console.log(cv.getBuildInformation());
      this.onInit();
    }
  }
} 

OpenCVUitl.prototype.onInit = function() {
  this.src = new cv.Mat();
  this.contours = new cv.MatVector();
  this.hierarchy = new cv.Mat();
  this.cvReady = true;
  if(this.readyCallback) {
    this.readyCallback(true);
  }
} 

OpenCVUitl.prototype.loadImage = function(url) {
  if(!this.cvReady) {
    throw new Error("OpenCV Runtime is not ready");
  }

  this.imgLoaded = false;
  this.src.delete();
  this.contours.delete();
  this.hierarchy.delete();
  this.contours = new cv.MatVector();
  this.hierarchy = new cv.Mat();
  this.selectedShapes = [];
  this.filteredShapes = [];

  let self = this;

  let canvas = document.getElementById(this.canvasId);
  let ctx = canvas.getContext('2d');
  let img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    self.src = cv.imread(self.canvasId);
    self.imgLoaded = true;
    self.findShapes();
    self.drawShapes();
  };
  img.src = url;
}

OpenCVUitl.prototype.setThreshold = function(val) {
  if(isNaN(val)) {
     throw new Error("Threshold is not a number");
  }
  if(val < 0 || val > 255) {
    throw new Error("Threshold is out of bounds");
  }
  this.threshold = parseInt(val);
  if(this.imgLoaded) {
    this.findShapes();
    this.drawShapes();
  }
}

OpenCVUitl.prototype.setSizeThreshold = function(val) {
  if(isNaN(val)) {
     throw new Error("Threshold is not a number");
  }
  this.sizeThreshold = parseInt(val);
  this.drawShapes();
}

OpenCVUitl.prototype.findShapes = function() {
  if(!this.imgLoaded) {
    console.log("Target image not yet loaded");
    return;
  }
  let tmp = new cv.Mat();
  let dst = new cv.Mat();

  cv.cvtColor(this.src, dst, cv.COLOR_BGR2RGB);
  cv.cvtColor(dst, tmp, cv.COLOR_RGB2GRAY);

  //cv.blur(tmp, tmp, new cv.Size(3,3));
  //cv.Canny(tmp, tmp, this.threshold, this.threshold*2);

  cv.threshold(tmp, tmp, this.threshold, 200, cv.THRESH_BINARY_INV);

  cv.findContours(tmp, this.contours, this.hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  tmp.delete();
  dst.delete();
}

OpenCVUitl.prototype.drawShapes = function() {
  if(!this.imgLoaded) {
    console.log("Target image not yet loaded");
    return;
  }
  this.filteredShapes = [];
  let dst = new cv.Mat();
  let green = new cv.Scalar(0, 255, 0);
  let red = new cv.Scalar(255, 0, 0);

  cv.cvtColor(this.src, dst, cv.COLOR_BGR2RGB);

  let minArea = Infinity;
  let maxArea = 0;
  for (let i = 0; i < this.contours.size(); ++i) {
    let c = green;
    let area = cv.contourArea(this.contours.get(i));
    if(area < minArea) {
      minArea = area;
    }
    if(area > maxArea) {
      maxArea = area;
    }
    if(area < this.sizeThreshold) {
      continue;
    }
    if(this.selectedShapes.length > 0 && this.selectedShapes[0][0] == i) {
      c = red;
    }
    cv.drawContours(dst, this.contours, i, c, 2, cv.LINE_8, this.hierarchy, 100);
    this.filteredShapes.push(i);
  }
  console.log(this.filteredShapes.length, minArea, maxArea);

  cv.imshow(this.outputCanvasId, dst);

  dst.delete();
}

OpenCVUitl.prototype.findClickedContour = function(x, y) {
  if(isNaN(x) || isNaN(y)) {
     throw new Error("Invalid coordinates");
  }
  let point = new cv.Point(x, y);
  this.selectedShapes = [];
  this.filteredShapes.forEach(i => {
    let contour = this.contours.get(i);
    let distance = cv.pointPolygonTest(contour, point, true);
    if(distance > -2) {
      this.selectedShapes.push(
        [i, cv.contourArea(contour), cv.arcLength(contour, true).toFixed(2)]
      );
    }   
  }); 
}

OpenCVUitl.prototype.canvasClick = function(e) {
  this.findClickedContour(e.offsetX, e.offsetY);
  this.drawShapes();
  if(this.selectCallback) {
    this.selectCallback(this.selectedShapes);
  }
}


export { OpenCVUitl };
