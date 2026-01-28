const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const textInput = document.getElementById("textInputOverlay");

let tool = "pen";
let color = "#ffffff";
let size = 5;
let drawing = false;
let startX = 0, startY = 0;

let history = [];
let step = -1;

function resizeCanvas() {
  const r = canvas.parentElement.getBoundingClientRect();
  canvas.width = r.width;
  canvas.height = r.height;
  restore();
}
window.addEventListener("resize", resizeCanvas);

function save() {
  step++;
  history = history.slice(0, step);
  history.push(canvas.toDataURL());
}

function restore() {
  if (step < 0) return;
  const img = new Image();
  img.src = history[step];
  img.onload = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img,0,0);
  };
}

canvas.addEventListener("mousedown", e => {
  const r = canvas.getBoundingClientRect();
  startX = e.clientX - r.left;
  startY = e.clientY - r.top;

  if (tool === "text") return showText(startX,startY);

  drawing = true;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
});

canvas.addEventListener("mousemove", e => {
  if (!drawing) return;

  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  ctx.lineWidth = size;
  ctx.lineCap = "round";

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.lineTo(x,y);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
  if (drawing) {
    drawing = false;
    save();
  }
});

function showText(x,y){
  textInput.style.display="block";
  textInput.style.left=x+"px";
  textInput.style.top=y+"px";
  textInput.focus();

  textInput.onkeydown=e=>{
    if(e.key==="Enter"){
      ctx.fillStyle=color;
      ctx.font=`600 ${size*3+12}px Inter`;
      ctx.fillText(textInput.value,x,y+20);
      textInput.value="";
      textInput.style.display="none";
      save();
    }
  };
}

document.querySelectorAll(".tool-btn[data-tool]").forEach(b=>{
  b.onclick=()=>{
    document.querySelector(".tool-btn.active")?.classList.remove("active");
    b.classList.add("active");
    tool=b.dataset.tool;
  };
});

document.querySelectorAll(".color-swatch").forEach(c=>{
  c.onclick=()=>{
    document.querySelector(".color-swatch.active")?.classList.remove("active");
    c.classList.add("active");
    color=c.dataset.color;
  };
});

document.getElementById("sizeSlider").oninput=e=>size=e.target.value;
document.getElementById("undo").onclick=()=>{ if(step>0){ step--; restore(); }};
document.getElementById("redo").onclick=()=>{ if(step<history.length-1){ step++; restore(); }};
document.getElementById("clearBoard").onclick=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); save(); };

document.getElementById("themeToggle").onclick=()=>{
  const dark=document.body.dataset.theme==="dark";
  document.body.dataset.theme=dark?"light":"dark";
  document.getElementById("themeIcon").textContent=dark?"☀️":"🌙";
  document.getElementById("themeText").textContent=dark?"Light":"Dark";
};

resizeCanvas();
save();
