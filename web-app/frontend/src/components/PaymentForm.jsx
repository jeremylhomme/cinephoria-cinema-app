import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

const PaymentForm = ({
  clientSecret,
  handlePaymentSuccess,
  handlePaymentError,
  setProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    // Validate form fields
    const email = document.getElementById("email-address").value.trim();
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();

    if (!email || !firstName || !lastName) {
      toast.error("Please fill out all required fields.");
      setProcessing(false);
      return;
    }

    if (!stripe || !elements) {
      toast.error("Stripe.js has not loaded yet. Please try again later.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`,
            email: email,
          },
        },
      }
    );

    if (error) {
      handlePaymentError(`Payment failed: ${error.message}`);
      setProcessing(false);
    } else {
      handlePaymentSuccess(paymentIntent);
      setProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="email-address"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          type="email"
          id="email-address"
          name="email-address"
          autoComplete="email"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="first-name"
          className="block text-sm font-medium text-gray-700"
        >
          First name
        </label>
        <input
          type="text"
          id="first-name"
          name="first-name"
          autoComplete="given-name"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="last-name"
          className="block text-sm font-medium text-gray-700"
        >
          Last name
        </label>
        <input
          type="text"
          id="last-name"
          name="last-name"
          autoComplete="family-name"
          required
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <CardElement
          id="card-element"
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                fontFamily: "sans-serif",
                "::placeholder": {
                  color: "#a0aec0",
                },
                padding: "10px 14px",
                borderRadius: "0.375rem",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              },
              invalid: {
                color: "#e53e3e",
                iconColor: "#e53e3e",
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md border border-transparent bg-green-700 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        Confirm order
      </button>
    </form>
  );
};

export default PaymentForm;
