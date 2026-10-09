import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./firebase"; // Импортируем Supabase клиент

function App() {
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    return {
      invitationId: idParam || null,
      step: idParam ? "invitation" : "home",
      data: {
        topText: "Assalomu Aleykum",
        title: "",
        subtitle: "",
        description: "Hayotimizdagi eng baxtli kunimizni siz bilan birga nishonlashdan mamnun bo‘lamiz.",
        firstName: "",
        secondName: "",
        day: "",
        month: "",
        year: "",
        time: "",
        weekday: "",
        restaurant: "",
        address: "",
        bottomText: "",
      },
      bgImg: "",
      cImg: "",
    };
  };

  const initialState = getInitialState();

  const [step, setStep] = useState(initialState.step);
  const [data, setData] = useState(initialState.data);
  const [backgroundImage, setBackgroundImage] = useState(initialState.bgImg);
  const [centerImage, setCenterImage] = useState(initialState.cImg);

  const [bgFile, setBgFile] = useState(null);
  const [centerFile, setCenterFile] = useState(null);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // SUPABASE'DAN MA'LUMOT O'QISH (ID BO'LSA)
  // =========================
  useEffect(() => {
    const fetchInvitation = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (id) {
        setLoading(true);
        try {
          const { data: invData, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;

          if (invData) {
            setData({
              topText: invData.top_text || "",
              title: invData.title || "",
              subtitle: invData.subtitle || "",
              description: invData.description || "",
              firstName: invData.first_name || "",
              secondName: invData.second_name || "",
              day: invData.day || "",
              month: invData.month || "",
              year: invData.year || "",
              time: invData.time || "",
              weekday: invData.weekday || "",
              restaurant: invData.restaurant || "",
              address: invData.address || "",
              bottomText: invData.bottom_text || "",
            });
            setBackgroundImage(invData.bg_img || "");
            setCenterImage(invData.c_img || "");
            setStep("invitation");
          }
        } catch (error) {
          console.error("Taklifnomani yuklashda xatolik:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, []);

  // =========================
  // MUSIQA LOGIKASI
  // =========================
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    audio.loop = true;

    const startMusic = () => {
      if (!audio) return;
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    startMusic();

    const handleInteraction = () => {
      startMusic();
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [step]);

  const backgroundSamples = [
    "https://images.uzum.uz/d8l97oc9g1ktqmltd9n0/original.jpg",
    "https://images.uzum.uz/d8jvajbsv8vo2t0kpbag/t_product_540_high.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa-AK9rS2rbLai_ZxVquvv0W1uz1CpBdi3G-w0Nr3jxg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTMfx_x1vb7sPIAFxcVYurSJNvfjIDFG2MrByGZHX2Nw2PLt-e0WU9NS2p&s=10",
  ];

  const centerSamples = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWBMuDPyw7NC4fdlaqVk7abfHa_lVSipdmaRbwOVxJewqRHMvEj26KEdg&s=10",
    "https://png.pngtree.com/thumb_back/fw800/background/20230314/pngtree-wedding-ring-engagement-background-image_1947930.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYDstFkj0Wro56qOzGPrPicvoxdekpJMoOCLhIng2fEg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV78bdKzGbqK0_GjIvMn4vgysyLwsCSa_7QiN8VuPHGg&s=10",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    if (type === "background") {
      setBackgroundImage(imageUrl);
      setBgFile(file);
    }
    if (type === "center") {
      setCenterImage(imageUrl);
      setCenterFile(file);
    }
  };

  const playMusicFromStart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  // =========================
  // FAYLNI BASE64 MATNGA O'GIRISH (STORAGE SIZ SAQLASH UCHUN)
  // =========================
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // =========================
  // TAKLIFNOMANI TAYYORLASH VA SUPABASE'GA SAQLASH
  // =========================
  const handleSaveAndPrepare = async () => {
    setLoading(true);
    try {
      let finalBgUrl = backgroundImage;
      let finalCenterUrl = centerImage;

      if (bgFile) {
        finalBgUrl = await convertFileToBase64(bgFile);
      }
      if (centerFile) {
        finalCenterUrl = await convertFileToBase64(centerFile);
      }

      const newId = Date.now().toString();

      const { error } = await supabase.from("invitations").insert([
        {
          id: newId,
          top_text: data.topText,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          first_name: data.firstName,
          second_name: data.secondName,
          day: data.day,
          month: data.month,
          year: data.year,
          time: data.time,
          weekday: data.weekday,
          restaurant: data.restaurant,
          address: data.address,
          bottom_text: data.bottomText,
          bg_img: finalBgUrl || "",
          c_img: finalCenterUrl || "",
        },
      ]);

      if (error) throw error;

      const newUrl = `${window.location.origin}${window.location.pathname}?id=${newId}`;
      window.history.pushState({ path: newUrl }, "", newUrl);

      setBackgroundImage(finalBgUrl);
      setCenterImage(finalCenterUrl);
      playMusicFromStart();
      setStep("invitation");
    } catch (error) {
      console.error("Saqlashda xatolik yuz berdi:", error.message);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ULASHISH (PODELITSA)
  // =========================
  const handleShare = () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: `${data.firstName} & ${data.secondName} To'y Taklifnomasi`,
          text: "Sizni to'yimizga taklif etamiz!",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const globalAudio = (
    <audio ref={audioRef} src="/music/11.mp3" preload="auto" loop />
  );

  if (loading) {
    return (
      <div className="home-page" style={{ justifyContent: "center", alignItems: "center", color: "#fff" }}>
        {globalAudio}
        <h2>Yuklanmoqda, iltimos kuting...</h2>
      </div>
    );
  }

  // =========================
  // 1-BEKAT: HOME
  // =========================
  if (step === "home") {
    return (
      <>
        {globalAudio}

        <div
          className="home-page"
          style={{
            backgroundImage: "url('https://aniq.uz/photos/news/zLvhjXoa0mshkyx.jpeg')",
          }}
        >
          <div className="home-overlay"></div>

          <div className="wedding-rings" aria-hidden="true">
            <div className="ring ring-left"></div>
            <div className="ring ring-right"></div>
            <div className="ring-glow ring-glow-left"></div>
            <div className="ring-glow ring-glow-right"></div>
          </div>

          <div className="home-content">
            <p className="home-label">TAKLIFNOMA</p>
            <h1>
              Sizning maxsus
              <br />
              kuningiz
            </h1>
            <div className="home-line"></div>
            <p className="home-description">
              Yaqinlaringiz uchun chiroyli va
              <br />
              unutilmas taklifnoma yarating.
            </p>

            <button
              className="main-button"
              onClick={() => {
                playMusicFromStart();
                setStep("editor");
              }}
            >
              Taklifnoma yaratish
              <span>→</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // =========================
  // 2-BEKAT: EDITOR
  // =========================
  if (step === "editor") {
    return (
      <>
        {globalAudio}

        <div className="editor-page">
          <div className="editor-container">
            <button
              className="back-button"
              onClick={() => {
                playMusicFromStart();
                setStep("home");
              }}
            >
              ← Orqaga
            </button>

            <div className="editor-header">
              <p>TAKLIFNOMA YARATISH</p>
              <h1>Ma’lumotlaringizni kiriting</h1>
              <span>Quyidagi maydonlarni o‘zingizga mos qilib to‘ldiring.</span>
            </div>

            <div className="form-card">
              {/* ASOSIY */}
              <div className="form-section">
                <h2>Asosiy yozuvlar</h2>
                <div className="form-grid">
                  <label>
                    Yuqoridagi yozuv
                    <input name="topText" value={data.topText} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Asosiy sarlavha
                    <input name="title" value={data.title} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Sarlavha ostidagi yozuv
                    <input name="subtitle" value={data.subtitle} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label className="full-width">
                    Taklif matni
                    <textarea name="description" value={data.description} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* ISMLAR */}
              <div className="form-section">
                <h2>Ismlar</h2>
                <div className="form-grid">
                  <label>
                    Birinchi ism
                    <input name="firstName" value={data.firstName} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Ikkinchi ism
                    <input name="secondName" value={data.secondName} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* SANA */}
              <div className="form-section">
                <h2>Sana va vaqt</h2>
                <div className="form-grid">
                  <label>
                    Kun
                    <input name="day" value={data.day} onChange={handleChange} placeholder="15" />
                  </label>
                  <label>
                    Oy
                    <input name="month" value={data.month} onChange={handleChange} placeholder="OKTABR" />
                  </label>
                  <label>
                    Yil
                    <input name="year" value={data.year} onChange={handleChange} placeholder="2026" />
                  </label>
                  <label>
                    Vaqt
                    <input type="time" name="time" value={data.time} onChange={handleChange} />
                  </label>
                  <label>
                    Hafta kuni
                    <input name="weekday" value={data.weekday} onChange={handleChange} placeholder="Shanba" />
                  </label>
                </div>
              </div>

              {/* MANZIL */}
              <div className="form-section">
                <h2>To‘y joyi</h2>
                <div className="form-grid">
                  <label>
                    Restoran / To‘yxona
                    <input name="restaurant" value={data.restaurant} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Manzil
                    <input name="address" value={data.address} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* RASMLAR */}
              <div className="form-section">
                <h2>Rasmlar</h2>
                <div className="image-upload-grid">
                  {/* ORQA FON */}
                  <div className="upload-box-wrapper">
                    <label className="upload-box">
                      <span className="upload-icon">✦</span>
                      <strong>Orqa fon rasmi</strong>
                      <small>Telefondan rasm tanlash</small>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "background")} />
                      {backgroundImage && <img className="upload-preview" src={backgroundImage} alt="Fon preview" />}
                    </label>

                    <div className="sample-images-wrapper">
                      <small>Yoki tayyor namunalardan tanlang:</small>
                      <div className="sample-images">
                        {backgroundSamples.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Fon namuna ${index + 1}`}
                            className={`sample-thumb ${backgroundImage === imgUrl ? "selected" : ""}`}
                            onClick={() => {
                              setBackgroundImage(imgUrl);
                              setBgFile(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* MARKAZIY RASM */}
                  <div className="upload-box-wrapper">
                    <label className="upload-box">
                      <span className="upload-icon">♡</span>
                      <strong>Markaziy rasm</strong>
                      <small>Telefondan rasm tanlash</small>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "center")} />
                      {centerImage && <img className="upload-preview" src={centerImage} alt="Markaziy rasm preview" />}
                    </label>

                    <div className="sample-images-wrapper">
                      <small>Yoki tayyor namunalardan tanlang:</small>
                      <div className="sample-images">
                        {centerSamples.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Markaziy namuna ${index + 1}`}
                            className={`sample-thumb ${centerImage === imgUrl ? "selected" : ""}`}
                            onClick={() => {
                              setCenterImage(imgUrl);
                              setCenterFile(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* YAKUN */}
              <div className="form-section">
                <h2>Yakuniy yozuv</h2>
                <div className="form-grid">
                  <label className="full-width">
                    Pastdagi yozuv
                    <input name="bottomText" value={data.bottomText} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* TAYYORLASH */}
              <button className="prepare-button" onClick={handleSaveAndPrepare}>
                Taklifnomani tayyorlash <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // =========================
  // 3-BEKAT: INVITATION
  // =========================
  return (
    <>
      {globalAudio}

      <div
        className="invitation-page"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      >
        <div className="invitation-overlay"></div>

        <div className="invitation-card">
          <p className="invitation-top">{data.topText}</p>
          <h1>{data.title}</h1>
          <div className="star">✦</div>
          <h2>{data.subtitle}</h2>
          <p className="invitation-description">{data.description}</p>

          {centerImage && (
            <div className="center-photo-wrapper">
              <img className="center-photo" src={centerImage} alt="Taklifnoma" />
            </div>
          )}

          <div className="couple-names">
            <span>{data.firstName}</span>
            <b>&</b>
            <span>{data.secondName}</span>
          </div>

          <div className="date-info">
            <div className="date-item">
              <strong>{data.day}</strong>
              <span>{data.month}</span>
              <small>{data.year}</small>
            </div>

            <div className="date-divider"></div>

            <div className="date-item">
              <strong>{data.time}</strong>
              <span>BOSHLANISHI</span>
              <small>{data.weekday}</small>
            </div>
          </div>

          <div className="venue">
            <div className="venue-icon">⌖</div>
            <div>
              <strong>{data.restaurant}</strong>
              <p>{data.address}</p>
            </div>
          </div>

          <p className="invitation-bottom">{data.bottomText}</p>

          <button className={`share-button ${copied ? "copied" : ""}`} onClick={handleShare}>
            <span className="share-icon">{copied ? "✓" : "✦"}</span>
            <span>{copied ? "Nusxalandi!" : "Ulashish"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
