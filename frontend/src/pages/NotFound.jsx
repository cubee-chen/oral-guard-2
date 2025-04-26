import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    // Cleanup if the user navigates away early
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ margin: "2rem", textAlign: "center" }}>
      <h1>404 - 找不到此頁面</h1>
      <p>3秒後將自動導回首頁...</p>
    </div>
  );
}

export default NotFound;
