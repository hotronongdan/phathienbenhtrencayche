// ============================
// MODEL TEACHABLE MACHINE (của bạn)
// ============================
const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/H10_xOd1g/";

// Ngưỡng dùng nội bộ để cảnh báo kết quả có thể chưa rõ (KHÔNG hiển thị phần trăm)
const CONFIDENCE_THRESHOLD = 0.60;

// ============================
// HƯỚNG DẪN XỬ LÝ THEO TỪNG BỆNH
// LƯU Ý: label phải khớp 100% với Teachable Machine
// ============================
const TREATMENT_GUIDE = {
  "Cây khỏe mạnh": {
    text:
      "Không phát hiện dấu hiệu bệnh.\n" +
      "Khuyến nghị chăm sóc:\n" +
      "1) Bón phân cân đối, không lạm dụng đạm.\n" +
      "2) Tỉa cành định kỳ để vườn thông thoáng.\n" +
      "3) Theo dõi thường xuyên để phát hiện sớm sâu bệnh."
  },

  "Bệnh đốm nâu": {
    text:
      "Biểu hiện: đốm nâu trên lá, lan nhanh khi ẩm độ cao.\n\n" +
      "Hướng xử lý:\n" +
      "1) Cắt bỏ và tiêu hủy lá bị bệnh.\n" +
      "2) Giữ vườn thông thoáng, hạn chế tưới làm ướt lá.\n" +
      "3) Nếu lan rộng, liên hệ cán bộ kỹ thuật hoặc BVTV để xử lý đúng cách."
  },

  "Bệnh phồng lá": {
    text:
      "Biểu hiện: lá non phồng rộp, biến dạng, cây sinh trưởng kém.\n\n" +
      "Hướng xử lý:\n" +
      "1) Loại bỏ sớm lá bị bệnh nặng.\n" +
      "2) Điều chỉnh bón phân, tránh thừa đạm.\n" +
      "3) Giữ vườn khô ráo, tăng thông thoáng trong mùa mưa."
  },

  "Bệnh đốm trắng": {
    text:
      "Biểu hiện: đốm trắng xám trên lá, làm giảm quang hợp.\n\n" +
      "Hướng xử lý:\n" +
      "1) Thu gom và tiêu hủy lá bệnh.\n" +
      "2) Tăng thông thoáng, giảm độ ẩm trong tán.\n" +
      "3) Áp dụng biện pháp phòng trừ theo khuyến cáo kỹ thuật địa phương."
  },

  "Bệnh thối búp": {
    text:
      "Biểu hiện: búp non thối, chuyển nâu đen, dễ rụng.\n\n" +
      "Hướng xử lý:\n" +
      "1) Thu hái và loại bỏ búp bệnh.\n" +
      "2) Tránh để vườn quá ẩm, hạn chế tưới phun lên búp.\n" +
      "3) Nếu lan nhanh, liên hệ cán bộ kỹ thuật để được hướng dẫn xử lý."
  },

  "Bệnh tảo đỏ": {
    text:
      "Biểu hiện: mảng đỏ nâu trên cành hoặc lá, thường gặp khi ẩm độ cao.\n\n" +
      "Hướng xử lý:\n" +
      "1) Cắt tỉa cành rậm, tạo thông thoáng.\n" +
      "2) Vệ sinh vườn, giảm ẩm, thoát nước tốt.\n" +
      "3) Theo dõi định kỳ, xử lý theo khuyến cáo nếu bệnh lan rộng."
  },

  // THÊM 2 BỆNH MỚI
  "Bệnh thối rễ": {
    text:
      "Biểu hiện thường gặp: cây héo rũ, lá vàng, sinh trưởng chậm, rễ nâu đen và có mùi.\n" +
      "Nguyên nhân hay gặp: đất úng nước, thoát nước kém, nấm phát triển mạnh khi ẩm.\n\n" +
      "Hướng xử lý:\n" +
      "1) Cải tạo thoát nước, không để úng, xới nhẹ quanh gốc cho đất thông thoáng.\n" +
      "2) Loại bỏ cây bị nặng, vệ sinh tàn dư rễ để tránh lây lan.\n" +
      "3) Bổ sung hữu cơ hoai mục, tăng vi sinh có lợi.\n" +
      "4) Nếu diện rộng, liên hệ cán bộ BVTV để được hướng dẫn xử lý phù hợp."
  },

  "Bệnh nấm tóc": {
    text:
      "Biểu hiện thường gặp: nấm dạng sợi mảnh như tóc trên cành hoặc bề mặt lá, có thể kèm mốc đen.\n" +
      "Điều kiện thuận lợi: vườn rậm, ẩm cao, thiếu nắng, thông thoáng kém.\n\n" +
      "Hướng xử lý:\n" +
      "1) Tỉa cành tạo độ thông thoáng, giảm ẩm trong tán.\n" +
      "2) Vệ sinh vườn, loại bỏ lá cành bị nặng và tiêu hủy.\n" +
      "3) Hạn chế tưới phun lên tán vào chiều tối.\n" +
      "4) Khi cần, xử lý theo khuyến cáo kỹ thuật địa phương."
  }
};

// ============================
// BIẾN TOÀN CỤC
// ============================
let classifier = null;
let video = null;
let canvas = null;

let statusEl, labelEl, hintEl;
let btnStart, btnStop, btnRetry;

let isModelReady = false;
let isCameraRunning = false;
let isClassifying = false;

let lastLabel = "Chưa có";
let lastConfidence = 0;

// ============================
// p5.js
// ============================
function setup() {
  canvas = createCanvas(360, 270);
  canvas.parent("canvas-holder");

  statusEl = document.getElementById("statusText");
  labelEl = document.getElementById("labelText");
  hintEl = document.getElementById("hintText");

  btnStart = document.getElementById("btnStart");
  btnStop = document.getElementById("btnStop");
  btnRetry = document.getElementById("btnRetry");

  btnStart.addEventListener("click", async () => {
    setStatus("Đang bật camera sau...");
    await startRearCamera();
  });

  btnStop.addEventListener("click", () => stopCamera());

  btnRetry.addEventListener("click", async () => {
    setStatus("Đang thử lại camera sau...");
    stopCamera();
    await startRearCamera();
  });

  setStatus("Đang tải mô hình AI...");
  classifier = ml5.imageClassifier(TM_MODEL_URL + "model.json", () => {
    isModelReady = true;
    setStatus("Mô hình đã sẵn sàng. Hãy bật camera để bắt đầu.");
    maybeStartClassifyLoop();
  });

  updateResultUI("Chưa có", 0);
}

function draw() {
  background(245);

  if (isCameraRunning && video) {
    image(video, 0, 0, width, height);

    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(10, 10, width - 20, height - 20);
  } else {
    fill(90);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Chưa bật camera.\nNhấn nút Bật camera sau để bắt đầu.", width / 2, height / 2);
  }
}

// ============================
// CAMERA
// ============================
async function startRearCamera() {
  if (isCameraRunning && video) {
    setStatus("Camera đang chạy.");
    maybeStartClassifyLoop();
    return;
  }

  return new Promise((resolve) => {
    const constraints = {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    };

    video = createCapture(constraints, () => {
      isCameraRunning = true;
      video.size(width, height);
      video.hide();

      setStatus("Camera đã bật. Đang nhận diện...");
      maybeStartClassifyLoop();
      resolve();
    });

    setTimeout(() => {
      if (!isCameraRunning) {
        setStatus("Không bật được camera. Hãy kiểm tra quyền Camera của trang web trong trình duyệt.");
        resolve();
      }
    }, 1500);
  });
}

function stopCamera() {
  if (video && video.elt && video.elt.srcObject) {
    const tracks = video.elt.srcObject.getTracks();
    tracks.forEach((t) => t.stop());
  }

  if (video) {
    try { video.remove(); } catch (e) {}
  }

  video = null;
  isCameraRunning = false;
  isClassifying = false;

  setStatus("Đã tắt camera.");
  updateResultUI("Chưa có", 0);
}

// ============================
// NHẬN DIỆN
// ============================
function maybeStartClassifyLoop() {
  if (!isModelReady) return;
  if (!isCameraRunning) return;
  if (!video) return;
  if (isClassifying) return;

  isClassifying = true;
  classifyFrame();
}

function classifyFrame() {
  if (!isClassifying) return;
  if (!isModelReady || !isCameraRunning || !video) return;

  classifier.classify(video, (err, results) => {
    if (err) {
      console.error(err);
      setStatus("Lỗi nhận diện. Hãy thử lại camera.");
      isClassifying = false;
      return;
    }

    if (results && results.length > 0) {
      // CHỈ LẤY TOP 1, KHÔNG HIỂN THỊ PHẦN TRĂM
      const top = results[0];
      const label = (top.label || "").trim();
      const confidence = (typeof top.confidence === "number") ? top.confidence : 0;

      lastLabel = label || "Chưa có";
      lastConfidence = confidence;

      updateResultUI(lastLabel, lastConfidence);
    }

    setTimeout(classifyFrame, 200);
  });
}

// ============================
// UI
// ============================
function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function updateResultUI(label, confidence) {
  if (labelEl) labelEl.textContent = label || "Chưa có";

  const guide = TREATMENT_GUIDE[label];

  if (guide) {
    let note = guide.text;

    // Không hiển thị %, chỉ nhắc nếu kết quả chưa chắc
    if (confidence > 0 && confidence < CONFIDENCE_THRESHOLD) {
      note =
        "Gợi ý: Kết quả có thể chưa rõ do ánh sáng hoặc góc chụp.\n" +
        "Hãy tăng ánh sáng, giữ máy ổn định và đưa lá gần hơn, rồi thử lại.\n\n" +
        note;
    }

    hintEl.textContent = note;
    setStatus("Đang nhận diện...");
  } else {
    if (label === "Chưa có") {
      hintEl.textContent = "Chưa có kết quả. Hãy bật camera để bắt đầu.";
    } else {
      hintEl.textContent =
        "Chưa có hướng dẫn cho nhãn này.\n" +
        "Bạn kiểm tra lại tên lớp trong Teachable Machine có khớp với code hay không.";
    }
  }
}
