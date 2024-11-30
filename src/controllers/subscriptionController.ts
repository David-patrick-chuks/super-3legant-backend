// controllers/subscriptionController.ts
import { Request, Response } from 'express';
import { User } from '../models/User'; // Import the User model
import { flw } from '../config/flutterwaveConfig'; // Import the Flutterwave instance
import axios from 'axios';

const planPrices = {
    free: 0,
    pro: { monthly: 19, yearly: 190 },
    business: { monthly: 99, yearly: 990 },
    enterprise: { monthly: 999, yearly: 9990 },
};

const addOnPrices = {
    extraMessages: { monthly: 9, yearly: 90 },
    extraAIAgent: { monthly: 9, yearly: 90 },
    removeBrand: { monthly: 49, yearly: 490 },
    customBrand: { monthly: 59, yearly: 590 },
};

// TypeScript types for plan keys and billing cycle
type PlanType = keyof typeof planPrices;
type AddOnType = keyof typeof addOnPrices;

// Handle plan subscription payment
export const subscribeToPlan = async (req: Request, res: Response): Promise<void> => {
    const { email, plan, billingCycle } = req.body;
    const planType: PlanType = plan || 'free'; // Ensure planType is valid
    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly'; // Default to monthly

    const planDetails = planPrices[planType];
    let totalAmount = 0;

    // Calculate total amount based on the billing cycle
    if (typeof planDetails === 'number') {
        totalAmount = planDetails; // Free plan
    } else if (planDetails[cycle]) {
        totalAmount = planDetails[cycle];
    }

    if (totalAmount === 0 && planType !== 'free') {
        res.status(400).json({ message: 'Invalid plan selected' });
        return;
    }

    const clientIp =
        (typeof req.headers["x-forwarded-for"] === "string"
            ? req.headers["x-forwarded-for"].split(",")[0].trim()
            : null) || req.ip;

    const payload = {
        tx_ref: `TX-${Date.now()}`,
        amount: totalAmount,
        currency: 'USD',
        redirect_url: `http://localhost:${process.env.PORT}/callback`,
        email,
        payment_options: 'card, mobilemoneyghana, ussd',
        client_ip: clientIp,
        customizations: {
            title: `Subscription for ${planType}`,
            description: `Subscribe to the ${planType} plan (${cycle})`,
        },
    };

    try {
        const response = await flw.PaymentInitiate(payload);

        // Update user plan in the database after successful payment
        if (response.data.status === 'success') {
            const user = await User.findOne({ email });
            if (user) {
                user.plan = planType;
                user.billingCycle = cycle; // Save billing cycle
                await user.save();
                res.json({ message: 'Payment successful, plan updated.' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};

// Handle add-on subscription payment
export const subscribeToAddons = async (req: Request, res: Response): Promise<void> => {
    const { email, addOns, billingCycle } = req.body;
    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly'; // Default to monthly

    let totalAmount = 0;

    // Calculate the total price for the selected add-ons
    addOns.forEach((addOn: string) => {
        if (addOnPrices[addOn as AddOnType]) {
            totalAmount += addOnPrices[addOn as AddOnType][cycle];
        }
    });

    if (totalAmount === 0) {
        res.status(400).json({ message: 'No valid add-ons selected' });
        return;
    }

    const clientIp =
        (typeof req.headers["x-forwarded-for"] === "string"
            ? req.headers["x-forwarded-for"].split(",")[0].trim()
            : null) || req.ip;

    const payload = {
        tx_ref: `TX-${Date.now()}`,
        amount: totalAmount,
        currency: 'USD',
        redirect_url: `http://localhost:${process.env.PORT}/callback`,
        email,
        payment_options: 'card, mobilemoneyghana, ussd',
        client_ip: clientIp,
        customizations: {
            title: 'Add-ons for Subscription',
            description: `Purchase add-ons (${cycle})`,
        },
    };

    try {
        const response = await flw.PaymentInitiate(payload);

        // Update user add-ons in the database after successful payment
        if (response.data.status === 'success') {
            const user = await User.findOne({ email });
            if (user) {
                user.addOns = addOns;
                user.addOnsBillingCycle = cycle; // Save billing cycle for add-ons
                await user.save();
                res.json({ message: 'Payment successful, add-ons updated.' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing add-on payment' });
    }
};



export const payWithFlutterwave = async (req: Request, res: Response): Promise<void>  => {
    const { amount, email, phonenumber, name } = req.body;
  
    if (!email || !amount) {
       res.status(400).json({ error: "Email and amount are required" });
       
       return
    }
  
    const payload = {
      tx_ref: `tx-${Date.now()}`,
      amount,
      currency: "NGN",
      redirect_url: "http://localhost:5555/verify",
      payment_options: "card",
      customer: {
        email,
        phonenumber,
        name,
      },
      customizations: {
        title: "Pied Piper Payments",
        description: "Middleout isn't free. Pay the price",
        logo: "https://th.bing.com/th/id/OIP.nkMc-fJ_uS6k2G8g4czkYgHaFb?rs=1&pid=ImgDetMain",
      },
    };
  
    try {
      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };
  
 export  const verifyPayment = async (req: Request, res: Response): Promise<void>  => {
    const { transaction_id } = req.query;
  
    if (!transaction_id) {
       res.status(400).json({ error: "Transaction ID is required" });
       return
    }
  
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };
  
