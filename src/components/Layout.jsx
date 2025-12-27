import React from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ route, onRoute, children }) {
  return (
    <div className="container">
      <Sidebar route={route} onRoute={onRoute} />
      <div className="main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
