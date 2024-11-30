import dotenv from "dotenv";

dotenv.config();
const Flutterwave = require('flutterwave-node-v3');
// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const flw = new Flutterwave(String(process.env.FLUTTERWAVE_PUBLIC_KEY), String(process.env.FLUTTERWAVE_SECRET_KEY));
const fetchSubscription = async () => {

    try {

        const response = await flw.Subscription.fetch_all()
        console.log(response);
    } catch (error) {
        console.log(error)
    }

}
const createPaymentPlan = async () => {
    try {
        const payload = {
            currency:"USD",
            amount: 1000,
            name: 'SDK test Plan O1', //This is the name of the payment, it will appear on the subscription reminder emails
            interval: 'monthly', //This will determine the frequency of the charges for this plan. Could be monthly, weekly, etc.
        };

        const response = await flw.PaymentPlan.create(payload);
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};

const fetchAllPlans = async () => {
    try {
      const response = await flw.PaymentPlan.get_all();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  
  fetchAllPlans();
// createPaymentPlan();

// fetchSubscription();