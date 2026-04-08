const sendEmail = require("./utils/sendEmail");

// dummy data
const user = {
  name: "Aditya",
  email: "dityamahalpure@gmail.com", // 👈 put your email
};

const event = {
  title: "Music Concert",
  date: "10 April 2026",
  time: "7 PM",
  venue: "Pune Stadium",
};

const booking = {
  quantity: 2,
  totalPrice: 1000,
};

// 🔥 TEST FUNCTION
const testEmails = async () => {
  try {
    // 1. Welcome Email
    await sendEmail({
      to: user.email,
      subject: "Welcome 🎉",
      templateName: "welcome",
      data: { name: user.name },
    });

    // 2. OTP Email
    await sendEmail({
      to: user.email,
      subject: "Your OTP",
      templateName: "otp",
      data: { name: user.name, otp: "123456" },
    });

    // 3. Booking Email
    await sendEmail({
      to: user.email,
      subject: "Booking Confirmed 🎟️",
      templateName: "booking",
      data: {
        name: user.name,
        eventTitle: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        tickets: booking.quantity,
        price: booking.totalPrice,
      },
    });

    // 4. Payment Email
    await sendEmail({
      to: user.email,
      subject: "Payment Successful 💳",
      templateName: "payment",
      data: {
        name: user.name,
        amount: 1000,
        transactionId: "TXN12345",
      },
    });

    // 5. Resale Email
    await sendEmail({
      to: user.email,
      subject: "Ticket Resale 🔁",
      templateName: "resale",
      data: {
        name: user.name,
        eventTitle: event.title,
      },
    });

    // 6. Password Reset Email
    await sendEmail({
      to: user.email,
      subject: "Reset Password 🔑",
      templateName: "resetPassword",
      data: {
        name: user.name,
        resetLink: "http://localhost:3000/reset",
      },
    });

    console.log("✅ All emails sent successfully");
  } catch (error) {
    console.log("❌ Error:", error);
  }
};

testEmails();