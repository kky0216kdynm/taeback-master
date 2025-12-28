import React, { useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HeadOffices from "./pages/HeadOffices.jsx";
import Stores from "./pages/Stores.jsx";
import Products from "./pages/Products.jsx";
import Orders from "./pages/Orders.jsx";
import Delivery from "./pages/Delivery.jsx";

export default function App() {
  const [route, setRoute] = useState("dashboard");

  // ✅ 본사 선택 상태(HeadOffices -> Stores 이동에 사용)
  const [selectedHeadOffice, setSelectedHeadOffice] = useState(null);
  // selectedHeadOffice = { id, name } 형태로 사용

  const page = useMemo(() => {
    if (route === "dashboard") return <Dashboard />;

    if (route === "headOffices")
      return (
        <HeadOffices
          onOpenStores={(headOffice) => {
            setSelectedHeadOffice(headOffice);
            setRoute("stores");
          }}
        />
      );

    if (route === "stores") return <Stores selectedHeadOffice={selectedHeadOffice} />;

    if (route === "products") return <Products />;
    if (route === "orders") return <Orders />;
    if (route === "delivery") return <Delivery />;
    return <Dashboard />;
  }, [route, selectedHeadOffice]);

  return (
    <Layout
      route={route}
      onRoute={(next) => {
        // 사이드바에서 stores로 바로 가는 경우도 있으니까
        // 선택된 본사가 없으면 Stores에서 '본사 선택' UI를 보여주게 하면 됨
        setRoute(next);
      }}
    >
      {page}
    </Layout>
  );
}
