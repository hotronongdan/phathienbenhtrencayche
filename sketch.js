// ============================
// MODEL TEACHABLE MACHINE
// ============================
const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/uaent8aRr/";

// Không hiển thị phần trăm, chỉ dùng nội bộ
const CONFIDENCE_THRESHOLD = 0.60;

// ============================
// CHỐT KẾT QUẢ VÀ DỪNG QUÉT
// ============================
const LOCK_THRESHOLD = 0.88;     // gặp >= ngưỡng này là chốt ngay, bạn thử 0.85 đến 0.92
const MAX_SCAN_MS = 3000;        // nếu sau thời gian này chưa đạt ngưỡng, chốt theo best ever
const CLASSIFY_INTERVAL_MS = 200;

// ============================
// HƯỚNG DẪN THEO NHÃN
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
      "Triệu chứng gây hại: Bệnh chủ yếu hại lá già, cành và quả. Trên lá, vết bệnh bắt đầu từ mép lá, có màu nâu, không có hình dáng nhất định hoặc hình bán nguyệt.\n\n" +
      "Biện pháp canh tác:\n" +
      "1) Dọn sạch lá khô rụng ở vườn chè để làm giảm nguồn bệnh năm sau.\n" +
      "2) Bón đủ phân, làm sạch cỏ, chống hạn tốt.\n" +
      "3) Khi đốn chè vùi lá (ép xanh) để tiêu diệt nguồn bệnh."
  },

  "Bệnh phồng lá": {
    text:
      "Triệu chứng gây hại: Vết bệnh phần lớn ở mép lá, trên lá xuất hiện những chấm nhỏ hình giọt dầu màu vàng nhạt, sau đó vết bệnh lớn dần. Phía dưới vết bệnh (mặt dưới lá) phồng lên và mặt trên lõm xuống, có giới hạn rõ rệt với phần lá khỏe. Cành bị hại sẽ bị chết.\n\n" +
      "Biện pháp canh tác:\n" +
      "1) Vệ sinh, không đốn tỉa quá sớm.\n" +
      "2) Bệnh xuất hiện tỉa các lá và búp chè bị bệnh.\n" +
      "3) Tiêu hủy tàn dư cây bệnh.\n" +
      "4) Thuốc BVTV có thể tham khảo: Imibenconazole, Ningnanmycin, Cucuminoid + Gingerol, Kasugamycin + Polyoxin."
  },

  "Bệnh dán cao": {
    text:
      "Triệu chứng gây hại: Ban đầu là một vết dán nhỏ màu trắng, mịn bám chặt vào cành hoặc thân cây, lá cây. Sau chuyển thành màu nâu vàng đến màu đỏ nâu bao bọc lấy thân cành như miếng dán cao.\n\n" +
      "Biện pháp phòng trừ:\n" +
      "1) Chọn giống khỏe, sạch sâu bệnh.\n" +
      "2) Thường xuyên vệ sinh đồng ruộng.\n" +
      "3) Hái chè áp dụng biện pháp hái kỹ, bón phân cân đối hợp lý."
  },

  "Bệnh thối búp": {
    text:
      "Triệu chứng gây hại: Bệnh xuất hiện ở lá non, cuống lá và cành non. Vết bệnh lúc đầu bằng đầu kim có màu đen, sau đó lan dần ra hết cả búp và cành chè. Thời tiết nóng ẩm lá dễ bị rụng.\n\n" +
      "Biện pháp canh tác:\n" +
      "1) Bón phân cân đối, tăng cường bón kali.\n" +
      "2) Vệ sinh đồng ruộng, thu gom tiêu hủy tàn dư cây bệnh, lá già rụng.\n" +
      "3) Nếu lan nhanh, liên hệ cán bộ kỹ thuật để được hướng dẫn.\n" +
      "4) Có thể tham khảo: Trichoderma viride, Citrusoil, Chitosan, Eugenol, tổ hợp dầu thực vật, lưu ý thời gian cách ly."
  },

  "Bệnh đốm xám": {
    text:
      "Triệu chứng gây hại: Vết bệnh trên lá có màu nâu sẫm, lúc đầu chỉ có chấm nhỏ màu đen sau đó lan ra khắp lá. Bệnh thường bắt đầu từ mép lá và làm cho lá rụng.\n\n" +
      "Biện pháp phòng trừ:\n" +
      "1) Chăm sóc để cây chè sinh trưởng tốt.\n" +
      "2) Vệ sinh vườn, diệt cỏ dại, ép xanh ngay sau đốn.\n" +
      "3) Thu gom lá bệnh, đốn chè tập trung trong thời gian ngắn.\n" +
      "4) Có thể tham khảo: Cucuminoid + Gingerol, Oligosaccharins, Trichoderma viride."
  },

  "Bệnh thối rễ": {
    text:
      "Triệu chứng gây hại: Phần rễ dưới đất bị mục nát, phần ngoài rễ có lớp tơ trắng mịn, giữa vỏ và rễ cây có sợi nấm màu nâu xám, hơi đen.\n\n" +
      "Biện pháp phòng trừ:\n" +
      "1) Bón phân chuồng hoai mục kết hợp chế phẩm Trichoderma.\n" +
      "2) Cây bị hại nhẹ có thể xử lý bằng Chitosan.\n" +
      "3) Cây bị nặng nhổ bỏ tiêu hủy, xử lý đất bằng vôi bột trước khi trồng lại."
  },

  "Bệnh nấm tóc": {
    text:
      "Triệu chứng gây hại: Nấm dạng sợi mảnh như tóc trên cành hoặc bề mặt lá, có thể kèm mốc đen.\n" +
      "Điều kiện thuận lợi: Vườn rậm, ẩm cao, thiếu nắng, thông thoáng kém.\n\n" +
      "Biện pháp phòng trừ:\n" +
      "1) Tỉa cành tạo thông thoáng, giảm ẩm trong tán.\n" +
      "2) Vệ sinh vườn, loại bỏ lá cành bị nặng và tiêu hủy.\n" +
      "3) Hạn chế tưới phun lên tán vào chiều tối.\n" +
      "4) Có thể phun thuốc gốc đồng hoặc Antracol 70WP theo hướng dẫn."
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

// chốt kết quả
let lockedLabel = "";
let lockedConfidence = 0;

// best ever trong lúc quét
let bestLabel = "";
let bestConfidence = 0;
let scanStartAt = 0;

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
    resetLockState();
    setStatus("Đang bật camera sau...");
    await startRearCamera();
  });

  btnStop.addEventListener("click", () => stopCamera());

  btnRetry.addEventListener("click", async () => {
    resetLockState();
    setStatus("Đang thử lại camera sau...");
    stopCamera();
    await startRearCamera();
  });

  setStatus("Đang tải mô hình AI...");
  classifier = ml5.imageClassifier(TM_MODEL_URL + "model.json", () => {
    isModelReady = true;
    setStatus("Mô hình đã sẵn sàng. Hãy bật camera để bắt đầu.");
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
    setStatus(lockedLabel ? "Đã chốt kết quả. Nhấn Thử lại để quét lại." : "Camera đang chạy.");
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
// RESET
// ============================
function resetLockState() {
  lockedLabel = "";
  lockedConfidence = 0;

  bestLabel = "";
  bestConfidence = 0;

  scanStartAt = 0;
  isClassifying = false;
}

// ============================
// NHẬN DIỆN
// ============================
function maybeStartClassifyLoop() {
  if (!isModelReady) return;
  if (!isCameraRunning) return;
  if (!video) return;

  if (lockedLabel) return;
  if (isClassifying) return;

  scanStartAt = Date.now();
  isClassifying = true;
  classifyFrame();
}

function lockResult(label, confidence, reasonText) {
  lockedLabel = label;
  lockedConfidence = confidence;

  updateResultUI(lockedLabel, lockedConfidence);
  setStatus(reasonText || "Đã chốt kết quả. Nhấn Thử lại để quét lại.");

  isClassifying = false;
}

function classifyFrame() {
  if (!isClassifying) return;
  if (!isModelReady || !isCameraRunning || !video) return;
  if (lockedLabel) {
    isClassifying = false;
    return;
  }

  classifier.classify(video, (err, results) => {
    if (err) {
      console.error(err);
      setStatus("Lỗi nhận diện. Hãy thử lại camera.");
      isClassifying = false;
      return;
    }

    if (results && results.length > 0) {
      const top = results[0];
      const label = (top.label || "").trim();
      const confidence = (typeof top.confidence === "number") ? top.confidence : 0;

      // Cập nhật UI theo top hiện tại để người dùng thấy đang quét
      updateResultUI(label || "Chưa có", confidence);

      // Luôn lưu best ever
      if (label && label !== "Chưa có" && confidence > bestConfidence) {
        bestLabel = label;
        bestConfidence = confidence;
      }

      // Nếu gặp ngưỡng cao, chốt ngay và dừng
      if (label && label !== "Chưa có" && confidence >= LOCK_THRESHOLD) {
        lockResult(label, confidence, "Đã chốt kết quả. Nhấn Thử lại để quét lại.");
        return;
      }

      // Nếu quá thời gian mà chưa đạt ngưỡng, chốt theo best ever để khỏi nhảy
      const elapsed = Date.now() - scanStartAt;
      if (elapsed >= MAX_SCAN_MS && bestLabel) {
        lockResult(bestLabel, bestConfidence, "Đã chốt kết quả. Nhấn Thử lại để quét lại.");
        return;
      }
    }

    setTimeout(classifyFrame, CLASSIFY_INTERVAL_MS);
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

    if (!lockedLabel && confidence > 0 && confidence < CONFIDENCE_THRESHOLD) {
      note =
        "Gợi ý: Kết quả có thể chưa rõ do ánh sáng hoặc góc chụp.\n" +
        "Hãy tăng ánh sáng, giữ máy ổn định và đưa lá gần hơn, rồi thử lại.\n\n" +
        note;
    }

    if (hintEl) hintEl.textContent = note;
    if (!lockedLabel) setStatus("Đang nhận diện...");
  } else {
    if (label === "Chưa có") {
      if (hintEl) hintEl.textContent = "Chưa có kết quả. Hãy bật camera để bắt đầu.";
    } else {
      if (hintEl) {
        hintEl.textContent =
          "Chưa có hướng dẫn cho nhãn này.\n" +
          "Bạn kiểm tra lại tên lớp trong Teachable Machine có khớp với code hay không.";
      }
    }
  }
}
