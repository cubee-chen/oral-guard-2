import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfileThunk } from "../store/slices/authSlice";
import "../css/TemplateDeliver.css";

function TemplateDeliver() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isPurchased, setIsPurchased] = useState(false);
  const [notionTemplateUrl, setNotionTemplateUrl] = useState(""); // Store template URL
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateName = searchParams.get("templatename");

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [prjDbUrlInput, setPrjDbUrlInput] = useState("");
  const [msnDbUrlInput, setMsnDbUrlInput] = useState("");
  const [notionInfoSubmittedPM, setNotionInfoSubmittedPM] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [typingText, setTypingText] = useState([]);

  const guideTextLines = [
    "1️⃣ 先將模板複製到自己 Notion 的 Private 底下",
    "2️⃣ 點擊並開啟『XX資料庫』",
    "3️⃣ 確認資料庫畫面為整個頁面 (full page)。",
    "4️⃣ 最後複製這個頁面的網址就完成了！",
    "💡 若有任何疑問，歡迎聯繫我們！",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // CRM Update
    fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson",
        crmKey: "templateDeliverPage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [API_BASE_URL]);

  // Simulate typing effect
  const typingTextRef = useRef([]);
  useEffect(() => {
    if (showBubble) {
      setTypingText([guideTextLines[0]]); // 立即顯示第一行
      typingTextRef.current = [guideTextLines[0]]; // 更新 ref
      let index = 1;
      const interval = setInterval(() => {
        if (index < guideTextLines.length) {
          typingTextRef.current = [
            ...typingTextRef.current,
            guideTextLines[index],
          ];
          setTypingText([...typingTextRef.current]); // 確保 state 正確更新
          index++;
        } else {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [showBubble]);

  const handlePurchase = async () => {
    console.log("button-clicked");

    if (!user || !templateName) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          templateName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPurchased(true);
        setNotionTemplateUrl(data.notionUrl);
        // Refresh user in Redux so purchased history is updated immediately
        dispatch(fetchUserProfileThunk());
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error purchasing template:", error);
    }
  };

  // Update User's notion info for Projecct Management(PM) template
  const handleNotionInfoSubmitPM = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/auth/update-notion-info/pm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            templateName,
            prjDbUrl: prjDbUrlInput,
            msnDbUrl: msnDbUrlInput,
          }),
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        alert(data.message);
        setNotionInfoSubmittedPM(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating Notion info:", error);
    }
  };

  return (
    <div
      className={`product-deliver-container ${showBubble ? "shift-right" : ""}`}
    >
      <h2 className="title">您已選擇 {templateName} 模板！</h2>
      <div className="content-box">
        {user ? (
          <>
            <h3 className="subtitle">模板連結將會寄送到以下 Email 信箱：</h3>
            <p className="email">{user.email}</p>
            {!isPurchased ? (
              <button className="purchase-button" onClick={handlePurchase}>
                購買並發送到 Email
              </button>
            ) : (
              <>
                <div className="purchased-message">
                  <div className="success-message">✅ 模板已發送！</div>
                  <a
                    href={notionTemplateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notion-link"
                  >
                    點擊此處開啟您的 Notion 模板
                  </a>
                </div>
                {/* If the template requires extra info, show the form */}
                {templateName === "專案管理" && !notionInfoSubmittedPM && (
                  <form
                    onSubmit={handleNotionInfoSubmitPM}
                    className="notion-info-form"
                  >
                    <label>
                      請貼上您私人 Notion 的「專案資料庫」連結:
                      <input
                        type="text"
                        value={prjDbUrlInput}
                        onChange={(e) => setPrjDbUrlInput(e.target.value)}
                        placeholder="專案資料庫連結"
                        required
                      />
                    </label>
                    <label>
                      請貼上您私人 Notion 的「任務資料庫」連結:
                      <input
                        type="text"
                        value={msnDbUrlInput}
                        onChange={(e) => setMsnDbUrlInput(e.target.value)}
                        placeholder="任務資料庫連結"
                        required
                      />
                    </label>

                    <div className="bottom-container">
                      <button
                        className="guide-button"
                        onClick={() => setShowBubble(!showBubble)}
                      >
                        💬 如何取得 Notion 的資料庫連結？
                      </button>
                      <button type="submit" className="purchase-button">
                        確認
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Chat Bubble */}
            {showBubble && (
              <div className="chat-bubble show-bubble">
                <span
                  className="chat-close"
                  onClick={() => setShowBubble(false)}
                >
                  ✖
                </span>
                <h3>如何取得 Notion 的資料庫連結？</h3>
                <div className="typing-text">
                  {typingText.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}
            {/*end*/}
          </>
        ) : (
          <h3 className="login-message">請先登入以繼續...</h3>
        )}
      </div>
    </div>
  );
}

export default TemplateDeliver;
