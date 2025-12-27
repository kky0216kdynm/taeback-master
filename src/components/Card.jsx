import React from "react";

export default function Card({ title, value, small }) {
  return (
    <div className="card">
      <div className="cardTitle">
        <span>{title}</span>
      </div>
      <div className="cardValue">{value}</div>
      {small ? <div className="cardSmall">{small}</div> : null}
    </div>
  );
}
