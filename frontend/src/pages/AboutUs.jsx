import { useEffect } from "react";
import { useSelector } from "react-redux";
import "../css/AboutUs.css";

function AboutUs() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // For CRM Purposes
  const { user } = useSelector((state) => state.auth);

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
        crmKey: "aboutUsPage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [API_BASE_URL]);

  const team = {
    CEO: [
      {
        name: "張鈞傑",
        role: "創辦人",
        dept: "農經二",
        image: "/team-members/junjie.jpg",
      },
    ],
    研發部: [
      {
        name: "陳宇禎",
        role: "技術長",
        dept: "大氣二",
        image: "/team-members/Cubee.png",
      },
      {
        name: "吳柏均",
        role: "全端工程師、模板開發",
        dept: "電機三",
        image: "/team-members/ddm.png",
      },
      {
        name: "蔡仁揚",
        role: "全端工程師、模板開發",
        dept: "電機四",
        image: "/team-members/yang.png",
      },
    ],
    營銷部: [
      {
        name: "陳秉宏",
        role: "營運長",
        dept: "心理三",
        image: "/team-members/cookie.png",
      },
      {
        name: "停彭蓮香",
        role: "市場分析師、行銷企劃",
        dept: "生傳五",
        image: "/team-members/TP.png",
      },
      {
        name: "林祐萱",
        role: "UI/UX、設計思考",
        dept: "創新二",
        image: "/team-members/Xuan.png",
      },
    ],
  };

  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <div className="team-hero-container">
        <section className="team-hero">
          {/* 
            If you want to keep <img>:
            <img src="/team-members/team.jpg" alt="NTU CTC 團隊合照" />
          */}
          <div className="intro-overlay">
            <h1>大家好，我們是 NTU CTC！</h1>
            <p>
              我們是一支專注於開發 Notion 模板的新創團隊，
              透過理論知識與演算法，期望打造最智慧化的數位工具，提升生產效率！
            </p>
          </div>
        </section>
      </div>

      {/* Main content */}
      <div className="about-us-content">
        {/* CEO Section */}
        <section className="team-section">
          <h2>執行長</h2>
          <div className="team-grid">
            {team.CEO.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.dept}</p>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 研發部 */}
        <section className="team-section">
          <h2>研發部</h2>
          <div className="team-grid">
            {team.研發部.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.dept}</p>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 營銷部 */}
        <section className="team-section">
          <h2>營銷部</h2>
          <div className="team-grid">
            {team.營銷部.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.dept}</p>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
