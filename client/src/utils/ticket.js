const toSafeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const formatDateTimeLabel = (date, time) => {
  if (!date && !time) {
    return "TBD";
  }

  if (date && time) {
    return `${date} • ${time}`;
  }

  return date || time || "TBD";
};

export const normalizeTicketData = (ticket = {}) => ({
  id: toSafeString(ticket.id || ticket.bookingId),
  userName: toSafeString(ticket.userName || ticket.username),
  eventName: toSafeString(ticket.eventName || ticket.event?.name || ticket.event),
  city: toSafeString(ticket.city || ticket.event?.city),
  venue: toSafeString(ticket.venue || ticket.event?.venue),
  date: toSafeString(ticket.date || ticket.event?.date),
  time: toSafeString(ticket.time),
  seats: Array.isArray(ticket.seats)
    ? ticket.seats.filter(Boolean)
    : toSafeString(ticket.seats)
      .split(",")
      .map((seat) => seat.trim())
      .filter(Boolean),
  amount: Number(ticket.amount ?? ticket.total ?? 0) || 0,
  method: toSafeString(ticket.method),
  transactionId: toSafeString(ticket.transactionId),
  receiptId: toSafeString(ticket.receiptId),
  status: toSafeString(ticket.status || "Confirmed"),
  category: toSafeString(ticket.category || ticket.event?.category),
  eventDate: toSafeString(ticket.eventDate),
});

export const buildTicketSearchParams = (ticket = {}) => {
  const normalized = normalizeTicketData(ticket);
  const params = new URLSearchParams();

  Object.entries({
    userName: normalized.userName,
    eventName: normalized.eventName,
    city: normalized.city,
    venue: normalized.venue,
    date: normalized.date,
    time: normalized.time,
    seats: normalized.seats.join(","),
    amount: normalized.amount ? String(normalized.amount) : "",
    method: normalized.method,
    transactionId: normalized.transactionId,
    receiptId: normalized.receiptId,
    status: normalized.status,
    category: normalized.category,
    eventDate: normalized.eventDate,
  }).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params;
};

export const buildTicketPath = (ticket = {}) => {
  const normalized = normalizeTicketData(ticket);
  const params = buildTicketSearchParams(normalized);
  const query = params.toString();

  return `/ticket/${encodeURIComponent(normalized.id || "preview")}${query ? `?${query}` : ""}`;
};

export const getTicketUrl = (ticket = {}) => {
  if (typeof window === "undefined") {
    return buildTicketPath(ticket);
  }

  return `${window.location.origin}${buildTicketPath(ticket)}`;
};

export const getTicketDateTimeLabel = (ticket = {}) => {
  const normalized = normalizeTicketData(ticket);
  return formatDateTimeLabel(normalized.date || normalized.eventDate, normalized.time);
};

export const getTicketFileName = (ticket = {}) => {
  const normalized = normalizeTicketData(ticket);
  const slug = (normalized.eventName || "ticket")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "ticket"}-${normalized.id || "booking"}.pdf`;
};