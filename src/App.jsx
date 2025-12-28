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

  // ✅ HeadOffices -> Stores 이동에 사용
  const [selectedHeadOffice, setSelectedHeadOffice] = useState(null);

  const page = useMemo(() => {
    if (route === "dashboard") return <Dashboard />;

    if (route === "headOffices") {
      return (
        <HeadOffices
          onOpenStores={(headOffice) => {
            setSelectedHeadOffice(headOffice); // {id, name}
            setRoute("stores");
          }}
        />
      );
    }

    if (route === "stores") {
      return <Stores selectedHeadOffice={selectedHeadOffice} />;
    }

    if (route === "products") return <Products />;
    if (route === "orders") return <Orders />;
    if (route === "delivery") return <Delivery />;

    return <Dashboard />;
  }, [route, selectedHeadOffice]);

  return (
    <Layout
      route={route}
      onRoute={(next) => {
        // ✅ 사이드바로 stores를 눌러도 정상 이동
        setRoute(next);

        // (선택) 본사/가맹점 흐름을 깔끔하게 하고 싶으면:
        // - 본사 목록으로 가면 선택 본사 초기화
        if (next === "headOffices") setSelectedHeadOffice(null);
      }}
    >
      {page}
    </Layout>
  );
}
