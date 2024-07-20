import React from "react";
import { Link, useParams } from "react-router-dom";
import LoaderFull from "../../components/LoaderFull";
import { useGetBookingDetailsQuery } from "../../redux/api/bookingApiSlice";

const BookingDetails = () => {
  const { id } = useParams();
  const { data: booking, isFetching, isError } = useGetBookingDetailsQuery(id);

  if (isFetching) return <LoaderFull />;
  if (isError)
    return <p>Erreur lors de la récupération des détails de la réservation.</p>;

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    };
    return new Date(date).toLocaleString("fr-FR", options);
  };

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-lg mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Détails de la réservation
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/admin/booking-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </Link>
              </div>
            </div>

            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white px-8 py-8 my-6 rounded-md sm:mx-auto sm:w-full sm:max-w-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0 w-1/2"
                        >
                          Champ
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold w-1/2"
                        >
                          Valeur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          ID
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.id}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Film
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.movie
                            ? booking.movie.movieTitle
                            : "Non disponible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Cinéma
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.session && booking.session.cinema
                            ? booking.session.cinema.cinemaName
                            : "Non disponible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date et heure de la séance
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.session.timeRange
                            ? formatDate(
                                booking.session.timeRange.timeRangeStartTime
                              )
                            : "Non disponible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Sièges réservés
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.seatsBooked
                            ? booking.seatsBooked
                                .map((seat) => seat.seatNumber)
                                .join(", ")
                            : "Non disponible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Prix de la réservation
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.bookingPrice
                            ? `${booking.bookingPrice.toFixed(2)} €`
                            : "Non disponible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Statut de la réservation
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          <span
                            className={`my-3.5 py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium ${
                              booking.bookingStatus === "confirmed"
                                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                : booking.bookingStatus === "pending"
                                ? "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                                : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                            }`}
                          >
                            {booking.bookingStatus === "confirmed"
                              ? "Confirmée"
                              : booking.bookingStatus === "pending"
                              ? "En attente"
                              : "Annulée"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date de création
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {booking.bookingCreatedAt
                            ? formatDate(booking.bookingCreatedAt)
                            : "Non disponible"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;
