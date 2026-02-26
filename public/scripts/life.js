window.onload = function() {
    const canvas = document.getElementById("canvasGrid");
    const ctx = canvas.getContext("2d");
    const currCell = document.getElementById("current-cell");
    let rectBuffer;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    let gridSize = 40; //size of each square in px;
    ctx.strokeStyle = "#e9e9e9";
    ctx.lineWidth = 2;

    // Draw vertical lines;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
    function  getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
          scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
          scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
      
        return {
          x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
          y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        }
      }
        //AI SLOP
      function highlightCell(getMousePos) {
        // 1. Calculate cell index
        let cellX = Math.floor(getMousePos.x / gridSize);
        let cellY = Math.floor(getMousePos.y / gridSize);
    
        // 2. Update UI text
        currCell.innerText = `${cellX}, ${cellY}`;
    
        // 3. Calculate drawing position
        // We multiply the index by the gridSize to get the pixel starting point
        let drawX = cellX * gridSize;
        let drawY = cellY * gridSize;
    
        // 4. Draw the rectangle
        // fillRect(startX, startY, width, height)
        ctx.fillStyle = "rgb(200 190 20/ 50%)"
        if(rectBuffer){ctx.clearRect(rectBuffer.x, rectBuffer.y, gridSize-(ctx.lineWidth), gridSize-(ctx.lineWidth));}
        ctx.fillRect(drawX+(ctx.lineWidth/2), drawY+(ctx.lineWidth/2), gridSize-(ctx.lineWidth), gridSize-(ctx.lineWidth));
        rectBuffer = {x: drawX+(ctx.lineWidth/2), y: drawY+(ctx.lineWidth/2)};
        console.log(rectBuffer);
        console.log(`Rect painted at: ${drawX}, ${drawY} with size ${gridSize}`);
    }
      canvas.addEventListener("pointerdown", function(e){
        console.log(getMousePos(canvas, e));
      });
      canvas.addEventListener("pointermove", function(e){
        highlightCell(getMousePos(canvas, e));
        console.log(getMousePos(canvas, e));

      });

};
