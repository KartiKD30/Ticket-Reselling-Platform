import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "../css/ConcertSelection.css";

const MAX_TICKETS = 10;

export default function ConcertSelection() {
  const { state: event } = useLocation();
  const navigate = useNavigate();
  const [selectedSections, setSelectedSections] = useState({});

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

  const ticketCount = useMemo(
    () => Object.values(selectedSections).reduce((sum, quantity) => sum + quantity, 0),
    [selectedSections],
  );

  const addSectionTicket = (sectionKey) => {
    setSelectedSections((prev) => {
      const currentTotal = Object.values(prev).reduce((sum, quantity) => sum + quantity, 0);
      if (currentTotal >= MAX_TICKETS) return prev;

      return {
        ...prev,
        [sectionKey]: (prev[sectionKey] || 0) + 1,
      };
    });
  };

  const removeSectionTicket = (sectionKey) => {
    setSelectedSections((prev) => {
      const currentQty = prev[sectionKey] || 0;
      if (!currentQty) return prev;

      if (currentQty === 1) {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      }

      return {
        ...prev,
        [sectionKey]: currentQty - 1,
      };
    });
  };

  const selectedItems = useMemo(() => {
    const sectionLookup = new Map(sections.map((section) => [section.id, section]));

    return Object.entries(selectedSections)
      .map(([key, quantity]) => {
        const match = key === vip.name ? vip : sectionLookup.get(key);
        if (!match || quantity <= 0) return null;

        return {
          id: key,
          label: match.id || match.name,
          price: match.price,
          quantity,
          subtotal: match.price * quantity,
        };
      })
      .filter(Boolean);
  }, [sections, selectedSections]);

  const seats = useMemo(
    () => selectedItems.flatMap((item) => Array.from({ length: item.quantity }, () => item.label)),
    [selectedItems],
  );

  const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);

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
            onClick={() => addSectionTicket(vip.name)}
            className={`concert-selection__interactive${selectedSections[vip.name] ? " concert-selection__interactive--selected" : ""}`}
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
                  onClick={() => addSectionTicket(sec.id)}
                  className={`concert-selection__interactive${selectedSections[sec.id] ? " concert-selection__interactive--selected" : ""}`}
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
        <p><strong>Tickets:</strong> {ticketCount || "-"}</p>

        {selectedItems.length > 0 ? (
          <div className="concert-selection__list">
            {selectedItems.map((item) => (
              <div key={item.id} className="concert-selection__item">
                <div>
                  <p className="concert-selection__item-name">{item.label}</p>
                  <p className="concert-selection__item-meta">
                    {item.quantity} x Rs. {item.price} = Rs. {item.subtotal}
                  </p>
                </div>
                <div className="concert-selection__item-actions">
                  <button type="button" onClick={() => removeSectionTicket(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => addSectionTicket(item.id)}
                    disabled={ticketCount >= MAX_TICKETS}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p><strong>Section:</strong> -</p>
        )}

        <p className="concert-selection__hint">
          Click the same area multiple times to add more tickets there. Max {MAX_TICKETS} tickets.
        </p>

        <h2 className="concert-selection__total">
          Rs. {total}
        </h2>

        <button
          className="concert-selection__button"
          onClick={() => {
            if (!ticketCount) return alert("Select at least one area");

            navigate("/payment", {
              state: {
                event,
                seats,
                total,
                date: event?.date,
                time: event?.time,
              },
            });
          }}
          disabled={!ticketCount}
        >
          Proceed to Payment -&gt;
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
