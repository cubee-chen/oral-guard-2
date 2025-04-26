import React from 'react';
import { Link } from 'react-router-dom';
import "../css/ProductIntro.css";

//! Can be converted to schema
const template_to_image = {
  "專案管理": "pm-product-intro.png"
};
const webpage_version = 2;

const ProductIntro = ({
  templateName,
  handleBuy
}) => {
  return (
    <>
      {(webpage_version === 1)?<>
        <div className="template-container">
          <div className="template-intro-container" style={{
            backgroundImage: `url("/images/${template_to_image[templateName]}")`,
            backgroundSize: "100%"
          }}>
          </div>
          <div className="template-buy-container">
            <h1 className="intro-title">{templateName}模板</h1>
            <div>專案有序，創意無限</div>
            <button className="intro-buy-button" onClick={handleBuy}>
              ˚₊‧&nbsp;立即獲得模板&nbsp;‧₊˚
            </button>
            <Link to="/" className="intro-back-link">返回首頁</Link>
          </div>
        </div>
      </>:<>
        <div className="template-intro-container-v2" style={{
          backgroundImage: `url("/images/${template_to_image[templateName]}")`,
          backgroundSize: "100%",
          aspectRatio: 1920 / 4296
        }}>
          <div className="template-buy-container-v2">
            <div className="button-shield-v2">
              <button className="intro-buy-button-v2" onClick={handleBuy}>
                ˚₊‧&nbsp;立即獲得模板&nbsp;‧₊˚
              </button>
              <Link to="/" className="intro-back-link-v2">返回首頁</Link>
            </div>
          </div>
        </div>
      </>}
    </>
  )
}

export default ProductIntro
