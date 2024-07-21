import React, { useMemo } from "react";
import { useGetBookingsQuery } from "../../redux/api/bookingApiSlice";
import LoaderFull from "../../components/LoaderFull";

const AdminDashboard = () => {
  const { data: bookings, error, isLoading } = useGetBookingsQuery();

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    };
    const formattedDate = new Date(date).toLocaleString("fr-FR", options);
    return formattedDate.replace(/ /, " - ");
  };

  const bookingDetails = useMemo(() => {
    if (!bookings) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = bookings.filter(
      (booking) => new Date(booking.bookingCreatedAt) >= sevenDaysAgo
    );

    const bookingsByMovie = recentBookings.reduce((acc, booking) => {
      const key = booking.movieId;
      if (!acc[key]) {
        acc[key] = {
          movieId: booking.movieId,
          movieTitle: booking.movie
            ? booking.movie.movieTitle
            : "Unknown Movie",
          bookings: [],
          count: 0,
        };
      }
      acc[key].bookings.push(booking);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(bookingsByMovie);
  }, [bookings]);

  if (isLoading) {
    return <LoaderFull />;
  }

  if (error) {
    return <div>Error: {error.data}</div>;
  }

  return (
    <>
      <div className="py-24">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
              Tableau de bord
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <p className="mt-2 px-3 text-sm">
                    Retrouvez les réservations effectuées au cours des 7
                    derniers jours.
                  </p>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-0 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="bg-white inline-block min-w-full py-6 align-middle shadow-sm rounded-md sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Titre du film
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Détails des réservations
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Nombre de réservations
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookingDetails.map((detail) => (
                          <tr key={detail.movieId}>
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {detail.movieTitle}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {detail.bookings.map((booking, index) => (
                                <div key={booking.id} className="mb-2">
                                  <p className="underline text-sm">
                                    Réservation {index + 1}:
                                  </p>
                                  <p className="text-sm">ID: {booking.id}</p>
                                  <p className="text-sm">
                                    ID de l'utilisateur : {booking.userId}
                                  </p>
                                  <p className="border-b pb-4 text-sm">
                                    Date :{" "}
                                    {formatDate(booking.bookingCreatedAt)}
                                  </p>
                                </div>
                              ))}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                              {detail.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bookingDetails.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-8">
                        Aucune réservation effectuée au cours des 7 derniers
                        jours.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
