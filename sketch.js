let currentPos = 1; 
let targetPos = 1;  
let activeWeek = 1;
const totalWeeks = 7; 
let isEntered = false;

let ticket;
let dragging = false;
let offsetX, offsetY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  ticket = document.getElementById('ticket');
  
  // 票券拖拽初始化
  if (ticket) {
    ticket.addEventListener('mousedown', (e) => {
      dragging = true;
      offsetX = e.clientX - ticket.offsetLeft;
      offsetY = e.clientY - ticket.offsetTop;
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (dragging && ticket) {
      ticket.style.left = (e.clientX - offsetX) + 'px';
      ticket.style.top = (e.clientY - offsetY) + 'px';
      ticket.style.bottom = 'auto'; // 釋放初始位置限制
      checkTicket();
    }
  });

  window.addEventListener('mouseup', () => { dragging = false; });
}

function checkTicket() {
  let dropZone = document.getElementById('drop-zone').getBoundingClientRect();
  if (!ticket) return;
  let ticketRect = ticket.getBoundingClientRect();

  // 檢查是否拖入虛線框
  if (
    ticketRect.left > dropZone.left &&
    ticketRect.right < dropZone.right &&
    ticketRect.top > dropZone.top &&
    ticketRect.bottom < dropZone.bottom
  ) {
    enterGallery();
  }
}

function enterGallery() {
  if (isEntered) return;
  isEntered = true;
  
  let welcome = document.getElementById('welcome-screen');
  welcome.style.opacity = '0';
  setTimeout(() => {
    welcome.style.display = 'none';
    let frames = document.querySelectorAll('.exhibit-group');
    frames.forEach(f => f.style.visibility = 'visible');
  }, 800);
}

function showExitMessage() {
  document.getElementById('exit-overlay').style.display = 'flex';
}

function draw() {
  if (!isEntered) return; // 未進場不繪製背景動畫

  clear(); 
  
  // 平滑翻頁邏輯
  if (abs(targetPos - currentPos) > totalWeeks / 2) {
    if (targetPos > currentPos) currentPos += totalWeeks;
    else currentPos -= totalWeeks;
  }
  currentPos = lerp(currentPos, targetPos, 0.1);
  
  if (currentPos > totalWeeks + 0.5) currentPos -= totalWeeks;
  if (currentPos < 0.5) currentPos += totalWeeks;

  drawOverheadLight(width / 2, height * 0.05);
  syncAllGroups();
  drawNav();
}

function drawOverheadLight(x, y) {
  push();
  fill(25, 20, 15); noStroke(); rectMode(CENTER);
  rect(x, y, 120, 30, 5);
  for (let i = 0; i < 130; i++) {
    let alpha = map(i, 0, 130, 100, 0); 
    let w = map(i, 0, 130, 120, 800); 
    fill(255, 240, 180, alpha); noStroke();
    ellipse(x, y + 20 + i * 5, w, 25);
  }
  pop();
}

function syncAllGroups() {
  for (let i = 1; i <= totalWeeks; i++) {
    let group = select('#group-week' + i);
    if (group) {
      let diff = i - currentPos;
      if (diff > totalWeeks / 2) diff -= totalWeeks;
      if (diff < -totalWeeks / 2) diff += totalWeeks;
      let xPos = diff * width;
      
      if (abs(diff) > 1.2) {
        group.style('display', 'none');
      } else {
        group.style('display', 'block');
        group.style('transform', `translate(calc(-50% + ${xPos}px), -50%)`);
        let brightness = map(abs(diff), 0, 0.8, 1, 0.3);
        group.style('filter', `brightness(${brightness})`);

        // 僅在第 7 週作品位於中央時顯示離場按鈕
        let exitBtn = document.getElementById('exit-btn');
        if (i === 7) {
          if (abs(diff) < 0.1) exitBtn.style.display = 'block';
          else exitBtn.style.display = 'none';
        }
      }
    }
  }
}

function drawNav() {
  textAlign(CENTER); fill(255, 100); textSize(14);
  text(activeWeek + " / " + totalWeeks, width / 2, height - 30);
  textSize(50); textFont('serif');
  text("«", 60, height / 2); text("»", width - 60, height / 2);
}

function mousePressed() {
  if (!isEntered) return;
  // 防止點擊 UI 時觸發翻頁
  if (mouseY > height - 100 && mouseX > width - 200) return;

  if (mouseX > width * 0.75) {
    activeWeek++;
    if (activeWeek > totalWeeks) activeWeek = 1;
    targetPos = activeWeek;
  } 
  else if (mouseX < width * 0.25) {
    activeWeek--;
    if (activeWeek < 1) activeWeek = totalWeeks;
    targetPos = activeWeek;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}