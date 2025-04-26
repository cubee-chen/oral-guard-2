import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TemplateCard from "../components/TemplateCard";
import { useSelector } from "react-redux";
import "../css/Home.css";

function Home() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [templates, setTemplates] = useState([]);

  // For CRM Purposes
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/template/get`);
        if (!resp.ok) {
          throw new Error(`HTTP error! ${resp.status}`);
        }
        const data = await resp.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
    
    // CRM Update
    fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson", 
        crmKey: "homePage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [API_BASE_URL]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Pinecraft</h1>
          <h3>你的 <span>Notion</span> 智慧設計師</h3>
          <blockquote>Crafting Your Notion Experience</blockquote>
        </div>
      </section>

      {/* Brand Intro Section */}
      <section className="brand-intro">
        <div className="brand-container">
          <img
            src="/images/logo.png"
            alt="Pinecraft Logo"
            className="brand-logo"
          />
          <div className="brand-text">
            <h2>你的 Notion 智慧設計師</h2>
            <p>
              PineCraft 的使命是幫助用戶最大化 Notion 的潛力，立志設計高效的
              Notion
              模板來革命性改變人們的工作和生活方式。我們堅持「精心打造您的
              Notion 體驗」的宗旨，致力於開發靈活且易於上手的 Notion
              模板，並結合結合演算法與AI的驅動，幫助用戶提升生產力，並探索新的工作流程可能性。
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="products-section">
        {templates.map((template, index) => (
          <TemplateCard
            key={template._id}
            template={template}
            isReversed={index % 2 !== 0}
            user={user}
          />
        ))}
      </section>
    </div>
  );
}

export default Home;
