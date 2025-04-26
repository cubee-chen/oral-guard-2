// src/pages/template-intro/TemplateIntro.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ProductIntro from "../components/ProductIntro";
import { useSelector } from "react-redux";
import "../css/TemplateIntro.css";

//! Can be converted to schema
const template_to_crm = {
  "專案管理": "pm",
  "好習慣養成": "habit",
  "生活規劃": "life",
};

function TemplateIntro() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [scrolled, setScrolled] = useState(false);
  const [searchParams] = useSearchParams();
  const templateName = searchParams.get("templatename") || "未知模板";
  const navigate = useNavigate();

  // For CRM Purposes
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo(0, 0);

    // CRM Scroll Detection
    const handleScroll = (e) => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const upThreshold = totalHeight * 0.2;
      const downThreshold = totalHeight * 0.8;
      if (scrolled){
        // if (window.scrollY < upThreshold){
        //   setScrolled(false);
        // }
      } else {
        if (window.scrollY >= downThreshold){
          // CRM Update
          fetch(`${API_BASE_URL}/api/crm/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user ? user.email : "randomPerson", 
              crmKey: `templateIntroPage.scrollToBottomTime.${template_to_crm[templateName]}`,
              crmValue: new Date().getTime(),
            }),
          });
          setScrolled(true);
        }
      }
      
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    // CRM Update
    fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson",
        crmKey: "templateIntroPage.viewTime",
        crmValue: new Date().getTime(),
      }),
    });
  }, [API_BASE_URL]);

  // You can optionally fetch template details here if needed
  // For now we assume static instructions

  const handleBuy = () => {
    // Navigate to the protected TemplateDeliver page
    navigate(`/template-deliver?templatename=${encodeURIComponent(templateName)}`);
  };

  return (
    <>
      <div>
        <ProductIntro templateName={templateName} handleBuy={handleBuy}/>
      </div>
      {/* <div className="template-intro-container">
        <h1 className="intro-title">{templateName} - 模板介紹</h1>
        <button className="intro-buy-button" onClick={handleBuy}>
          購買模板
        </button>
        <Link to="/" className="intro-back-link">返回首頁</Link>
      </div> */}
    </>
  );
}

export default TemplateIntro;
