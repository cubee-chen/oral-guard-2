import { Outlet } from "react-router-dom";

function NoHeaderLayout() {
  return (
    <div>
      {/* No header or footer here */}
      <Outlet />
    </div>
  );
}

export default NoHeaderLayout;
