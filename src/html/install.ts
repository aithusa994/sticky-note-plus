import ExtPay from "extpay";

var extpay = ExtPay("sticky-notes");

document.addEventListener("DOMContentLoaded", (e) => {
  const el = document.getElementById("pay-now");
  el.onclick = (e) => {
    extpay.openPaymentPage();
  };
});
