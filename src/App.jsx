import React, { useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HeadOffices from "./pages/HeadOffices.jsx";
import Stores from "./pages/Stores.jsx";
import Products from "./pages/Products.jsx";

export default function App() {
  const [route, setRoute] = useState("dashboard");

  const page = useMemo(() => {
    if (route === "dashboard") return <Dashboard />;
    if (route === "headOffices") return <HeadOffices />;
    if (route === "stores") return <Stores />;
    if (route === "products") return <Products />;
    return <Dashboard />;
  }, [route]);

  return (
    <Layout route={route} onRoute={setRoute}>
      {page}
    </Layout>
  );
}
