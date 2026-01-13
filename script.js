function mulaiAnalisis() {
  const landing = document.getElementById("landing");
  const quiz = document.getElementById("quiz");
  if (!landing || !quiz) {
    console.error("Elemen #landing atau #quiz tidak ditemukan");
    return;
  }
  landing.classList.add("hidden");
  quiz.classList.remove("hidden");
}

function kembaliKeQuiz() {
  const hasil = document.getElementById("hasil");
  const quiz = document.getElementById("quiz");
  if (!hasil || !quiz) {
    console.error("Elemen #hasil atau #quiz tidak ditemukan");
    return;
  }
  hasil.classList.add("hidden");
  quiz.classList.remove("hidden");
}

async function hitungJurusan() {
  const form = document.getElementById("quizForm");
  const resultEl = document.getElementById("result");
  const quizEl = document.getElementById("quiz");
  const hasilEl = document.getElementById("hasil");

  if (!form || !resultEl || !quizEl || !hasilEl) {
    console.error("Elemen form/result/quiz/hasil ada yang tidak ditemukan");
    return;
  }

  const data = new FormData(form);

  // Validasi jawaban
  if ([...data.values()].length === 0) {
    alert("Silakan jawab pertanyaan terlebih dahulu.");
    return;
  }

  // Skor jurusan
  let skor = { TI: 0, SI: 0, MN: 0, IK: 0, DKV: 0 };

  for (let value of data.values()) {
    if (skor.hasOwnProperty(value)) skor[value]++;
  }

  const namaJurusan = {
    TI: "Teknik Informatika",
    SI: "Sistem Informasi",
    MN: "Manajemen",
    IK: "Ilmu Komunikasi",
    DKV: "Desain Komunikasi Visual",
  };

  let jurusanTerbaik = Object.keys(skor).reduce((a, b) => (skor[a] >= skor[b] ? a : b));

  const prompt = `
Saya memiliki hasil tes minat jurusan dengan skor berikut:
${Object.keys(skor).map(j => `${namaJurusan[j]}: ${skor[j]}`).join(", ")}

Jurusan dengan skor tertinggi adalah ${namaJurusan[jurusanTerbaik]}.

Tolong:
1. Jelaskan mengapa jurusan ini cocok
2. Sebutkan prospek kariernya
3. Berikan saran singkat untuk pengembangan diri

Gunakan bahasa Indonesia yang jelas, singkat, dan mudah dipahami mahasiswa.
`.trim();

  resultEl.innerHTML = "<p>⏳ AI sedang menganalisis...</p>";

  try {
    const res = await fetch("./groq_api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const raw = await res.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error("Server tidak mengirim JSON. Isi respons: " + raw.slice(0, 200));
    }

    // Kalau status bukan 200, tampilkan error dari Groq/PHP
    if (!res.ok) {
      throw new Error(JSON.stringify(json));
    }

    // Ambil konten (format Groq biasanya choices[0].message.content)
    const content =
      json?.choices?.[0]?.message?.content ??
      json?.text ??
      "";

    if (!content) {
      throw new Error("Respon AI kosong / format tidak dikenali: " + JSON.stringify(json).slice(0, 200));
    }

    quizEl.classList.add("hidden");
    hasilEl.classList.remove("hidden");

    resultEl.innerHTML = `
      <h3>Rekomendasi Jurusan: ${namaJurusan[jurusanTerbaik]}</h3>
      <p>${content}</p>
    `;

    if (typeof gambarGrafik === "function") {
      gambarGrafik(skor, namaJurusan);
    }
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = `<p>❌ Error: ${String(err.message || err)}</p>`;
  }
}
