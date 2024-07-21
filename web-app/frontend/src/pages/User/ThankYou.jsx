import React from "react";
import { useParams } from "react-router-dom";
import { useGetBookingDetailsQuery } from "../../redux/api/bookingApiSlice";
import LoaderFull from "../../components/LoaderFull";

// Helper function to format date and time
const formatDateAndTime = (startTime, endTime) => {
  if (!startTime || !endTime) {
    console.error("Invalid startTime or endTime:", { startTime, endTime });
    return "Invalid date";
  }

  const date = new Date(startTime);
  if (!isFinite(date)) {
    console.error("Invalid startTime:", startTime);
    return "Invalid date";
  }

  const options = { weekday: "long", day: "numeric", month: "long" };
  const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(date);

  const startHours = date.getUTCHours().toString().padStart(2, "0");
  const startMinutes = date.getUTCMinutes().toString().padStart(2, "0");

  const endDate = new Date(endTime);
  if (!isFinite(endDate)) {
    console.error("Invalid endTime:", endTime);
    return "Invalid date";
  }

  const endHours = endDate.getUTCHours().toString().padStart(2, "0");
  const endMinutes = endDate.getUTCMinutes().toString().padStart(2, "0");

  return `${
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
  } de ${startHours}:${startMinutes} à ${endHours}:${endMinutes}`;
};

const ThankYou = () => {
  const { id } = useParams();
  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useGetBookingDetailsQuery(id);

  if (bookingLoading) {
    return <LoaderFull />;
  }

  if (bookingError || !booking) {
    return <div>Error loading booking details</div>;
  }

  const subtotal = (booking.bookingPrice / 1.2).toFixed(2);
  const total = booking.bookingPrice.toFixed(2);
  const tax = (total - subtotal).toFixed(2);

  return (
    <main className="relative lg:min-h-full">
      <div>
        <div className="mx-auto max-w-2xl px-10 py-12 my-16 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="lg:col-start-2">
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Votre commande est confirmée !
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Merci pour votre achat ! Vous recevrez un email de confirmation
              avec les détails de votre réservation.
            </p>

            <dl className="mt-4 font-medium">
              <dt className="text-gray-900">N° de commande :</dt>
              <dd className="mt-2 text-indigo-600">{booking._id}</dd>
            </dl>

            <ul
              role="list"
              className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500"
            >
              <li key={booking.movieId} className="flex space-x-6 py-6">
                <img
                  src={`${booking.movie.movieImg}`}
                  alt={booking.movie.movieTitle}
                  className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                />
                <div className="flex-auto space-y-1">
                  <h3 className="text-gray-900 text-base">
                    {booking.movie.title}
                  </h3>
                  <p className="text-sm">{booking.session.cinema.cinemaName}</p>
                  <p className="text-sm">
                    <span>
                      {formatDateAndTime(
                        booking.timeRange.timeRangeStartTime,
                        booking.timeRange.timeRangeEndTime
                      )}
                    </span>
                  </p>
                  <p className="text-sm">{`Seats: ${booking.seatsBooked
                    .map((seat) => seat.seatNumber)
                    .join(", ")}`}</p>
                </div>
              </li>
            </ul>

            <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd className="text-gray-900">{subtotal}€</dd>
              </div>
              <div className="flex justify-between">
                <dt>TVA (20%)</dt>
                <dd className="text-gray-900">{tax}€</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                <dt className="text-base">Total</dt>
                <dd className="text-base">{total}€</dd>
              </div>
            </dl>

            <div className="mt-16 border-t border-gray-200 py-6 text-right">
              <a
                href="/orders"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mes réservations
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
