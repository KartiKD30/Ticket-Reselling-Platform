import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/ConcertSelection.css";

export default function ConcertSelection() {
  const { state: event } = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  if (!event) return <p className="concert-selection__empty">No event selected</p>;

  const centerX = 350;
  const centerY = 260;

  const sections = [
    { id: "A1", color: "#f472b6", price: 3000 },
    { id: "A2", color: "#f472b6", price: 3000 },
    { id: "B1", color: "#c084fc", price: 3500 },
    { id: "B2", color: "#c084fc", price: 3500 },
    { id: "C1", color: "#22d3ee", price: 4500 },
    { id: "C2", color: "#22d3ee", price: 4500 },
    { id: "D1", color: "#facc15", price: 7000 },
    { id: "D2", color: "#facc15", price: 7000 },
    { id: "E1", color: "#fb923c", price: 5000 },
    { id: "E2", color: "#fb923c", price: 5000 },
    { id: "F1", color: "#34d399", price: 2500 },
    { id: "F2", color: "#34d399", price: 2500 },
    { id: "G1", color: "#60a5fa", price: 2000 },
    { id: "G2", color: "#60a5fa", price: 2000 },
  ];

  const vip = { name: "VIP", price: 10000 };

  const total = selected?.price || 0;

  return (
    <div className="concert-selection">
      <div className="concert-selection__map">
        <svg viewBox="0 0 700 600" width="100%" className="concert-selection__svg">

          <rect x="250" y="30" width="200" height="60" rx="12" fill="#111" />
          <text x="350" y="65" fill="#fff" textAnchor="middle">
            STAGE
          </text>

          <circle
            cx={centerX}
            cy={centerY}
            r={110}
            fill="#22c55e"
            onClick={() => setSelected(vip)}
            className="concert-selection__interactive"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
          >
            VIP
          </text>

          {sections.map((sec, i) => {
            const totalAngle = 300;
            const startOffset = 30;
            const angleSize = totalAngle / sections.length;

            const start = startOffset + i * angleSize;
            const end = start + angleSize;
            const mid = (start + end) / 2;

            const label = polarToCartesian(centerX, centerY, 190, mid);

            return (
              <g key={sec.id}>
                <path
                  d={describeArc(centerX, centerY, 150, start, end)}
                  stroke={sec.color}
                  strokeWidth="45"
                  fill="none"
                  onClick={() => setSelected(sec)}
                  className="concert-selection__interactive"
                />

                <text
                  x={label.x}
                  y={label.y}
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {sec.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="concert-selection__summary">
        <h3>Booking Summary</h3>

        <p><strong>Event:</strong> {event.name}</p>
        <p><strong>Section:</strong> {selected?.id || selected?.name || "-"}</p>

        <h2 className="concert-selection__total">
          ₹{total}
        </h2>

        <button
          className="concert-selection__button"
          onClick={() => {
            if (!selected) return alert("Select section");

            navigate("/payment", {
              state: {
                event,
                seats: [selected.id || selected.name],
                total,
                date: event?.date,
                time: event?.time,
              },
            });
          }}
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(x, y, r, start, end) {
  const startPt = polarToCartesian(x, y, r, end);
  const endPt = polarToCartesian(x, y, r, start);

  return [
    "M",
    startPt.x,
    startPt.y,
    "A",
    r,
    r,
    0,
    0,
    0,
    endPt.x,
    endPt.y,
  ].join(" ");
}
