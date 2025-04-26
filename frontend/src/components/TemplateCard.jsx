import { useNavigate } from "react-router-dom";
import "../css/TemplateCard.css";

//! Can be converted to schema
const template_to_crm = {
  "專案管理": "pm",
  "好習慣養成": "habit",
  "生活規劃": "life",
};

function TemplateCard({ template, isReversed, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleBuyClick = async (e) => {
    await handleHoverLeave(e);
    e.preventDefault();
    navigate(`/template-intro?templatename=${template.name}`);
  };

  const handleHover = async (e) => {
    // CRM Update
    await fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson", 
        crmKey: `homePage.hoverTime.${template_to_crm[template.name]}`,
        crmValue: new Date().getTime(),
      }),
    });
  }

  const handleHoverLeave = async (e) => {
    // CRM Update
    await fetch(`${API_BASE_URL}/api/crm/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : "randomPerson", 
        crmKey: `homePage.hoverLeaveTime.${template_to_crm[template.name]}`,
        crmValue: new Date().getTime(),
      }),
    });
  }

  return (
    <div 
      className={`product-card ${isReversed ? "reversed" : ""}`}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverLeave}
    >
      <div className="product-demo">
        <img src={template.imageUrl} alt={template.name} />
      </div>
      <div className="template-info">
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        {/* <div className="price-tag">NT: {template.price}</div> */}
        <button className="buy-button" onClick={handleBuyClick}>
          搶先體驗
        </button>
      </div>
    </div>
  );
}

export default TemplateCard;
