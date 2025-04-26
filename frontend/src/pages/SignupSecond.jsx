import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css/SignupSecond.css";

function SignupSecond() {
  // For CRM Purposes
  const { user } = useSelector((state) => state.auth);
  // 5 steps total:
  // 1: Google OAuth (auto-complete)
  // 2: 基本資料
  // 3: 注意事項
  // 4: Notion API
  // 5: 完成註冊 (final)

  const [activeStep, setActiveStep] = useState(2);

  // Step 2: Basic Info
  const [birthYear, setBirthYear] = useState(2000); // default year
  const [birthMonth, setBirthMonth] = useState(1);  // default month
  const [gender, setGender] = useState("");
  const [job, setJob] = useState("");

  // Step 4: Notion API (store token but finalize in step 5)
  const [notionToken, setNotionToken] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in with Google, redirect if needed.
    // If user is logged in => step 1 is done => show step 2.
  }, []);

  useEffect(() => {
    // CRM Update
    fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson",
        crmKey: "signupSecondPage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [API_BASE_URL]);

  // ---- Step 2: Submit Basic Info ----
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ birthYear, birthMonth, gender, job }),
      });
      if (resp.ok) {
        setActiveStep(3);
      } else {
        alert("更新資料失敗");
      }
    } catch (error) {
      console.error(error);
      alert("更新資料時發生錯誤");
    }
  };

  // Step 3 -> Step 4
  const handleAgreeNotices = () => {
    setActiveStep(4);
  };

  // Step 4 -> Step 5
  const handleNextFromStep4 = () => {
    setActiveStep(5);
  };

  // ---- Step 5: Final Submit (Store Notion Token, then navigate) ----
  const handleFinalSubmit = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notionToken }),
      });
      if (resp.ok) {
        alert("註冊完成！");
        navigate("/login");
      } else {
        alert("更新 API Token 失敗");
      }
    } catch (error) {
      console.error(error);
      alert("更新 API Token 時出錯");
    }
  };

  // Steps Data
  const steps = [
    {
      number: 1,
      label: "註冊 Google 帳號",
      renderContent: () => null, // auto-complete, no UI
    },
    {
      number: 2,
      label: "填寫基本資料",
      renderContent: () => (
        <div className="step-content">
          <h3>基本資料</h3>
          <form onSubmit={handleStep2Submit} className="step2-form">
            {/* 出生 row */}
            <div className="field-group">
              <label>生日（西元年；月）</label>
              <div className="birth-row">
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  min={1900}
                  max={2100}
                  className="birth-year"
                  required
                />
                <input
                  type="number"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  min={1}
                  max={12}
                  className="birth-month"
                  required
                />
              </div>
            </div>

            {/* 性別 */}
            <div className="field-group">
              <label>性別</label>
              <div className="gender-options">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="男"
                    checked={gender === "男"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  男
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="女"
                    checked={gender === "女"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  女
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="其他"
                    checked={gender === "其他"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  其他
                </label>
              </div>
            </div>

            {/* 工作或主修 */}
            <div className="field-group">
              <label>主修科系或職業</label>
              <div className="birth-row">
                <input
                  type="text"
                  placeholder="請輸入您的主修科系或工作"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="step-button">
              下一步
            </button>
          </form>
        </div>
      ),
    },
    {
      number: 3,
      label: "閱讀注意事項",
      renderContent: () => (
        <div className="step-content">
          <h3>請閱讀並同意以下注意事項</h3>
          <ul className="step-list-caution">
            <li>本系統會請求您的 Notion API Token</li>
            <li>請確保授權的範圍足夠使用該模板</li>
            <li>請勿盜用他人的 API Token</li>
          </ul>
          <button className="step-button" onClick={handleAgreeNotices}>
            我同意，下一步
          </button>
        </div>
      ),
    },
    {
      number: 4,
      label: "輸入 Notion API Token",
      renderContent: () => (
        <div className="step-content">
          <h3>如何授權 Notion API？</h3>
          <p className="step-text">請按照以下步驟來授權：</p>
          <ol className="step-list">
            <li>
              前往{" "}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noreferrer"
                className="step-link"
              >
                Notion Integration
              </a>
            </li>
            <li>
              創建新的 Integration！
              <img
                src="/images/integration-tutorial-1.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
            </li>
            <li>
              輸入以下資訊後，點擊右下角的「Save」，系統會自動進到下一頁設定。
              <img
                src="/images/integration-tutorial-2.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
              <img
                src="/images/integration-tutorial-3.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
            </li>
            <li>
              點擊「Show」、「Copy」以複製你的API Token。
              <img
                src="/images/integration-tutorial-4.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
              <img
                src="/images/integration-tutorial-5.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
            </li>
            <li>
              下滑頁面，勾選 <strong>Comment Capabilities</strong> 的「Read」和「Insert」，
              最後右下角「Save」以儲存。
              <img
                src="/images/integration-tutorial-6.png"
                alt="Notion API 設定教學"
                className="step-image"
              />
            </li>
            <li>貼上您剛才複製的 API Token</li>
          </ol>

          <div className="field-group">
            <label>Notion API Token</label>
            <div className="birth-row">
              <input
                type="text"
                className="step-input"
                placeholder="API Token"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="step-button" onClick={handleNextFromStep4}>
            下一步
          </button>
        </div>
      ),
    },
    {
      number: 5,
      label: "完成",
      renderContent: () => (
        <div className="step-content">
          <h3>完成註冊</h3>
          <p className="step-text">
            恭喜你已經填寫完所有必需的資料了！請點擊下方按鈕以完成註冊。
          </p>
          <button className="final-button" onClick={handleFinalSubmit}>
            確認
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="notion-setup-container">
      <div className="notion-box">
        {steps.map((step) => {
          const isCompleted = step.number < activeStep;
          const isActive = step.number === activeStep;
          const isUpcoming = step.number > activeStep;

          let circleClass = "circle";
          if (isCompleted) circleClass += " completed";
          else if (isActive) circleClass += " active";
          else if (isUpcoming) circleClass += " upcoming";

          return (
            <div className="step-wrapper" key={step.number}>
              <div className="step-header">
                <div className={circleClass}>
                  {isCompleted ? <i className="fas fa-check"></i> : step.number}
                </div>
                <div className="step-label">{step.label}</div>
              </div>

              {isActive && (
                <div className="step-collapsible animate-fade-slide">
                  {step.renderContent()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SignupSecond;
