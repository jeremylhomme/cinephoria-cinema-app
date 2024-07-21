import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { BASE_URL } from "../../redux/constants";
import { useGetUserProfileQuery } from "../../redux/api/userApiSlice";
import {
  useCreateOrUpdateBookingMutation,
  useGetBookingDetailsQuery,
} from "../../redux/api/bookingApiSlice";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const paymentMethods = [{ id: "credit-card", title: "Carte bancaire" }];

const PaymentForm = ({
  clientSecret,
  handlePaymentSuccess,
  handlePaymentError,
  setProcessing,
  processing,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    const email = document.getElementById("email-address").value.trim();
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();

    if (!email || !firstName || !lastName) {
      toast.error("Please fill out all required fields.");
      setProcessing(false);
      return;
    }

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
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
      <button
        type="submit"
        className="w-full rounded-md border border-transparent bg-green-700 px-4 py-3 mt-4 text-base font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 focus:ring-offset-gray-50"
      >
        {processing ? <Loader /> : "Payer"}
      </button>
    </form>
  );
};

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: bookingDetails,
    isLoading,
    isError,
  } = useGetBookingDetailsQuery(bookingId);
  const { data: userProfile } = useGetUserProfileQuery(userInfo?.id);

  const [createOrUpdateBooking] = useCreateOrUpdateBookingMutation();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (bookingDetails) {
      const amount = Math.round(bookingDetails.bookingPrice * 100);

      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount:", amount);
        setError("Invalid amount for payment");
        return;
      }

      axios
        .post(`${BASE_URL}/create-payment-intent`, { amount })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        })
        .catch((err) => {
          console.error("Error creating payment intent:", err);
          setError("Failed to create payment intent");
        });
    }
  }, [bookingDetails]);

  const handlePaymentSuccess = async (paymentIntent) => {
    setSucceeded(true);

    try {
      // Ensure that only the PUT request is made to update the booking
      const bookingResponse = await createOrUpdateBooking({
        bookingId,
        sessionId: bookingDetails.sessionId.toString(),
        userId: userProfile.id.toString(),
        movieId: bookingDetails.movieId.toString(),
        cinemaId: bookingDetails.session.cinema.id.toString(),
        roomId: bookingDetails.session.room.id.toString(),
        seatsBooked: bookingDetails.seatsBooked.map((seat) => ({
          seatId: seat.seatId,
          seatNumber: seat.seatNumber,
          status: "booked",
          pmrSeat: seat.pmrSeat,
        })),
        timeRange: {
          timeRangeId: bookingDetails.timeRange.timeRangeId,
          timeRangeStartTime: bookingDetails.timeRange.timeRangeStartTime,
          timeRangeEndTime: bookingDetails.timeRange.timeRangeEndTime,
        },
        bookingPrice: bookingDetails.bookingPrice,
        bookingStatus: "confirmed",
      }).unwrap();

      navigate(`/thank-you/${bookingResponse.booking._id}`);
    } catch (error) {
      console.error("Error creating/updating booking:", error);
      setError("Failed to create/update booking.");
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading booking details</div>;
  }

  if (!bookingDetails) {
    return <div>Error: Incomplete booking information</div>;
  }

  const subtotal = (bookingDetails.bookingPrice / 1.2).toFixed(2); // Calculate subtotal excluding 20% tax
  const total = bookingDetails.bookingPrice.toFixed(2);

  return (
    <Elements stripe={stripePromise}>
      <div className="bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Checkout</h2>
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Coordonnées
                </h2>
                <div className="mt-4">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse e-mail
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email-address"
                      name="email-address"
                      autoComplete="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={userProfile.userEmail}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 border-t border-gray-200 pt-4">
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prénom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="first-name"
                        name="first-name"
                        autoComplete="given-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        defaultValue={userProfile.userFirstName}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="last-name"
                        name="last-name"
                        autoComplete="family-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        defaultValue={userProfile.userLastName}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">Résumé</h2>
              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">Items in your booking</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  <li className="flex px-4 py-6 sm:px-6">
                    <div className="flex-shrink-0">
                      <img
                        src={bookingDetails.movie.movieImg}
                        alt={bookingDetails.movie.movieTitle}
                        className="w-20 rounded-md"
                      />
                    </div>
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm">
                            <a
                              href="#"
                              className="font-medium text-base text-gray-700 hover:text-gray-800"
                            >
                              {bookingDetails.movie.movieTitle}
                            </a>
                          </h4>
                          {bookingDetails.timeRange.length > 0 && (
                            <>
                              <p className="mt-1 text-sm text-gray-500">
                                Date:{" "}
                                {new Date(
                                  bookingDetails.timeRange[0].timeRangeStartTime
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  bookingDetails.timeRange[0].timeRangeStartTime
                                ).toLocaleTimeString()}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Cinema:{" "}
                                {bookingDetails.session.room.cinema.cinemaName}
                              </p>
                            </>
                          )}
                          <p className="mt-1 text-sm text-gray-500">
                            {`Prix par place : ${bookingDetails.session.sessionPrice}€`}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Numéros des places :{" "}
                            {bookingDetails.seatsBooked.map((seat) => (
                              <span
                                key={seat.seatNumber}
                                className="mr-2 bg-gray-100 rounded-md p-1"
                              >
                                {seat.seatNumber}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-800">Sous-total</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {subtotal}€
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-800">Taxes (20%)</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {(total - subtotal).toFixed(2)}€
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base text-gray-800 font-medium">
                      Total
                    </dt>
                    <dd className="text-base font-medium text-gray-800">
                      {total}€
                    </dd>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <fieldset className="">
                      <legend className="sr-only">Payment type</legend>
                      <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                        {paymentMethods.map(
                          (paymentMethod, paymentMethodIdx) => (
                            <div
                              key={paymentMethod.id}
                              className="flex items-center"
                            >
                              {paymentMethodIdx === 0 ? (
                                <input
                                  id={paymentMethod.id}
                                  name="payment-type"
                                  type="radio"
                                  defaultChecked
                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              ) : (
                                <input
                                  id={paymentMethod.id}
                                  name="payment-type"
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              )}
                              <label
                                htmlFor={paymentMethod.id}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {paymentMethod.title}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                      <div className="px-4 py-6 sm:px-6">
                        <PaymentForm
                          clientSecret={clientSecret}
                          handlePaymentSuccess={handlePaymentSuccess}
                          handlePaymentError={handlePaymentError}
                          setProcessing={setProcessing}
                          processing={processing}
                        />
                      </div>
                    </fieldset>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </Elements>
  );
};

export default Payment;
