import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfileThunk } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import "../css/UserProfile.css";

function UserProfile() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [selectedOption, setSelectedOption] = useState("基本資訊");

  // Inline editing state for the API Token
  const [editingToken, setEditingToken] = useState(false);
  // Toggle visibility of the token
  const [showToken, setShowToken] = useState(false);
  const [newToken, setNewToken] = useState("");

  // Inline editing for "專案管理" Notion info
  const [editingNotionInfo, setEditingNotionInfo] = useState(false);
  const [newMsn, setNewMsn] = useState("");
  const [newPrj, setNewPrj] = useState("");

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfileThunk());
    } else {
      setNewToken(user.notionToken || "");
    }
  }, [user, dispatch]);

  useEffect(() => {
    // CRM Update
    fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        crmKey: "userProfilePage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [user, API_BASE_URL]);

  // Update the user's notionToken
  const handleTokenUpdate = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notionToken: newToken }),
      });
      if (resp.ok) {
        alert("API Token 更新成功");
        setEditingToken(false);
        setShowToken(false); // optional: hide the token again after save
        dispatch(fetchUserProfileThunk());
      } else {
        alert("API Token 更新失敗");
      }
    } catch (error) {
      console.error(error);
      alert("更新 API Token 時出錯");
    }
  };

  // Update the user's Notion info for "專案管理"
  const handleNotionInfoUpdate = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/update-notion-info/pm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          templateName: "專案管理",
          msnDbUrl: newMsn,
          prjDbUrl: newPrj,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        alert("Notion 資料更新成功");
        setEditingNotionInfo(false);
        setNewMsn("");
        setNewPrj("");
        dispatch(fetchUserProfileThunk());
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("更新 Notion 資料失敗");
    }
  };

  // Loading or no user
  if (loading) return <div>載入中...</div>;
  if (!user) return <div>無法載入使用者資訊</div>;

  // Retrieve "專案管理" data if available
  const pmInfo =
    user.notionInfo && user.notionInfo["專案管理"]
      ? user.notionInfo["專案管理"]
      : null;

  return (
    <div className="profile-page">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div
          className={`sidebar-item ${
            selectedOption === "基本資訊" ? "selected" : ""
          }`}
          onClick={() => setSelectedOption("基本資訊")}
        >
          <i className="fas fa-user"></i>
          <span>基本資訊</span>
        </div>
        <div
          className={`sidebar-item ${
            selectedOption === "購買紀錄" ? "selected" : ""
          }`}
          onClick={() => setSelectedOption("購買紀錄")}
        >
          <i className="fas fa-shopping-cart"></i>
          <span>購買紀錄</span>
        </div>
        <div
          className={`sidebar-item ${
            selectedOption === "付費資訊" ? "selected" : ""
          }`}
          onClick={() => setSelectedOption("付費資訊")}
        >
          <i className="fas fa-cog"></i>
          <span>設定</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="user-profile-container">
        {selectedOption === "基本資訊" && (
          <div className="info-section">
            <h3>基本資訊</h3>

            {/* Username */}
            <div className="info-item">
              <span className="info-item-container">
                <p>用戶名稱</p>
                <input
                  type="text"
                  value={user.username}
                  disabled={true}
                  className="api-token-input"
                />
              </span>
            </div>

            {/* Email */}
            <div className="info-item">
              <span className="info-item-container">
                <p>電子信箱</p>
                <input
                  type="text"
                  value={user.email}
                  disabled={true}
                  className="api-token-input"
                />
              </span>
            </div>

            {/* Notion API Token */}
            <div className="info-item">
              <span className="info-item-container">
                <p>Notion API Token</p>

                <div className="token-col">
                  {/* Input + Eye Icon */}
                  <div className="token-input-container">
                    <input
                      type={showToken ? "text" : "password"}
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      disabled={!editingToken}
                      className="api-token-input"
                    />
                    {/* Eye Icon (toggle show/hide) */}
                    <button
                      type="button"
                      className="toggle-visibility-button"
                      onClick={() => setShowToken((prev) => !prev)}
                    >
                      <i
                        className={
                          showToken ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                      ></i>
                    </button>
                  </div>

                  {/* Button row below the input */}
                  <div className="token-button-row">
                    {editingToken ? (
                      <div className="info-buttons">
                        <button
                          onClick={() => {
                            setEditingToken(false);
                            setShowToken(false); // optional
                          }}
                        >
                          取消
                        </button>
                        <button onClick={handleTokenUpdate}>確認</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingToken(true);
                          setShowToken(true);
                        }}
                      >
                        編輯
                        <svg
                          style={{ marginLeft: "5px" }}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21.438 2.562a2.143 2.143 0 00-3.03 0L3.39 17.58a.75.75 0 00-.184.31l-1.109 4.437a.75.75 0 00.921.92l4.436-1.108a.75.75 0 00.312-.185l15.02-15.02a2.144 2.144 0 000-3.062zm-1.06 2l-1.064 1.06-1.503-1.503 1.063-1.06a.643.643 0 01.91 0l.593.593c.25.25.25.66 0 .91zm-2.124 2.124l1.502 1.504-9.46 9.46-1.503-1.503 9.46-9.46z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </span>
            </div>
          </div>
        )}

        {selectedOption === "購買紀錄" && (
          <div className="purchase-history-section">
            <h3>購買紀錄</h3>
            {user.purchasedTemplates && user.purchasedTemplates.length > 0 ? (
              <div className="purchase-grid">
                {user.purchasedTemplates.map((templateName, index) => (
                  <div key={index} className="purchase-item">
                    <h4>{templateName}</h4>

                    {/* If it's "專案管理", show the Notion DB fields */}
                    {templateName === "專案管理" && (
                      <div className="notion-info">
                        <p>
                          目前的專案資料庫ID:{" "}
                          {pmInfo?.prj_db_id ? pmInfo.prj_db_id : "尚未設定"}
                        </p>
                        <p>
                          目前的任務資料庫ID:{" "}
                          {pmInfo?.msn_db_id ? pmInfo.msn_db_id : "尚未設定"}
                        </p>

                        {editingNotionInfo ? (
                          /* Editing Mode */
                          <div className="notion-edit-wrapper">
                            <div className="notion-input-container">
                              <input
                                type="text"
                                value={newPrj}
                                onChange={(e) => setNewPrj(e.target.value)}
                                placeholder="新的專案資料庫連結"
                              />
                            </div>
                            <div className="notion-input-container">
                              <input
                                type="text"
                                value={newMsn}
                                onChange={(e) => setNewMsn(e.target.value)}
                                placeholder="新的任務資料庫連結"
                              />
                            </div>

                            {/* Buttons below inputs */}
                            <div className="token-button-row">
                              <div className="info-buttons">
                                <button
                                  onClick={() => setEditingNotionInfo(false)}
                                >
                                  取消
                                </button>
                                <button onClick={handleNotionInfoUpdate}>
                                  確認
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Not Editing */
                          <div className="token-button-row">
                            <button
                              onClick={() => {
                                setEditingNotionInfo(true);
                              }}
                            >
                              編輯
                              <svg
                                style={{ marginLeft: "5px" }}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                              >
                                <path d="M21.438 2.562a2.143 2.143 0 00-3.03 0L3.39 17.58a.75.75 0 00-.184.31l-1.109 4.437a.75.75 0 00.921.92l4.436-1.108a.75.75 0 00.312-.185l15.02-15.02a2.144 2.144 0 000-3.062zm-1.06 2l-1.064 1.06-1.503-1.503 1.063-1.06a.643.643 0 01.91 0l.593.593c.25.25.25.66 0 .91zm-2.124 2.124l1.502 1.504-9.46 9.46-1.503-1.503 9.46-9.46z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>目前尚無購買紀錄</p>
            )}
          </div>
        )}

        {selectedOption === "付費資訊" && (
          <div className="payment-info-section">
            <h3>付費資訊</h3>
            <p>開發中，尚未開放</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
