import ExtPay from "extpay";

var extpay = ExtPay("sticky-notes");
extpay.startBackground();

async function isPaid() {
  const user = await extpay.getUser();
  console.log(user);
  return user.paid;
}

function openPaymentPage() {
  extpay.openPaymentPage().catch((e) => {
    console.error(e);
  });
}

export { openPaymentPage, isPaid };
