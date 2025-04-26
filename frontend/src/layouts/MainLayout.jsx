import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfileThunk } from "../store/slices/authSlice";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import "../css/layout/MainLayout.css";

function MainLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // On initial mount, attempt to fetch profile if user is null
  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfileThunk());
    }
  }, [user, dispatch]);

  return (
    <>
      <Header isHomePage={isHomePage} />
      <main className={`main-content ${isHomePage ? "home-page" : "other-page"}`}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
