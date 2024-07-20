import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateIncidentMutation } from "../redux/api/incidentApiSlice";
import { useGetCinemasQuery } from "../redux/api/cinemaApiSlice";
import { useGetRoomsQuery } from "../redux/api/roomApiSlice";
import { useSelector } from "react-redux";

const IncidentAdd = () => {
  const user = useSelector((state) => state.auth.userInfo);
  const [cinemaId, setCinemaId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [incidentSubject, setIncidentSubject] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [rooms, setRooms] = useState([]);

  const [filteredRooms, setFilteredRooms] = useState([]);

  const navigate = useNavigate();
  const [createIncident, { isLoading }] = useCreateIncidentMutation();
  const { data: cinemas, isLoading: cinemasLoading } = useGetCinemasQuery();
  const { data: allRooms, isLoading: roomsLoading } = useGetRoomsQuery();

  useEffect(() => {
    if (cinemaId && allRooms) {
      const roomsForCinema = allRooms.filter(
        (room) => room.cinema.id === parseInt(cinemaId)
      );
      setFilteredRooms(roomsForCinema);
    } else {
      setFilteredRooms([]);
    }
    setRoomId("");
  }, [cinemaId, allRooms]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Utilisateur non authentifié. Veuillez vous connecter.");
      navigate("/login");
      return;
    }

    if (!cinemaId || !roomId || !incidentSubject || !incidentDescription) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const selectedCinema = cinemas.find(
      (cinema) => cinema.id === parseInt(cinemaId)
    );
    const cinemaName = selectedCinema ? selectedCinema.cinemaName : "";

    try {
      await createIncident({
        cinemaId: parseInt(cinemaId),
        cinemaName,
        roomId: parseInt(roomId),
        incidentSubject,
        incidentDescription,
        userId: user.id,
        incidentReportedBy: `${user.userFirstName} ${user.userLastName}`,
      }).unwrap();

      resetForm();
      toast.success("L'incident a été ajouté avec succès");
      navigate("/incidents");
    } catch (error) {
      toast.error("Une erreur s'est produite lors de l'ajout de l'incident.");
      console.error("Error adding incident:", error);
    }
  };

  const resetForm = () => {
    setCinemaId("");
    setRoomId("");
    setIncidentSubject("");
    setIncidentDescription("");
  };

  if (isLoading || cinemasLoading) return <div>Loading...</div>;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Ajouter un incident
                </h1>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/incidents"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </Link>
              </div>
            </div>
            <div className="my-12 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="rounded-md bg-white inline-block min-w-full pb-6 align-middle sm:px-6 lg:px-8">
                  <div className="min-w-full divide-y divide-gray-300">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="cinemaId"
                                className="block text-sm font-medium leading-6"
                              >
                                Cinéma*
                              </label>
                              <div className="mt-2">
                                <select
                                  value={cinemaId}
                                  onChange={(e) => setCinemaId(e.target.value)}
                                  className="block w-full rounded-md border-0 py-3 pl-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                >
                                  <option value="">
                                    Sélectionnez un cinéma
                                  </option>
                                  {cinemas?.map((cinema) => (
                                    <option key={cinema.id} value={cinema.id}>
                                      {cinema.cinemaName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label
                                htmlFor="roomId"
                                className="block text-sm font-medium leading-6"
                              >
                                Salle*
                              </label>
                              <div className="mt-2">
                                <select
                                  value={roomId}
                                  onChange={(e) => setRoomId(e.target.value)}
                                  className="block w-full rounded-md border-0 py-3 pl-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                  disabled={
                                    !cinemaId || filteredRooms.length === 0
                                  }
                                >
                                  <option value="">
                                    Sélectionnez une salle
                                  </option>
                                  {filteredRooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                      {room.roomNumber} - {room.roomQuality}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {cinemaId && filteredRooms.length === 0 && (
                                <p className="mt-2 text-sm text-red-600">
                                  Aucune salle disponible pour ce cinéma
                                </p>
                              )}
                              {!cinemaId && (
                                <p className="mt-2 text-sm text-red-600">
                                  Veuillez sélectionner un cinéma
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-3">
                              <label
                                htmlFor="incidentSubject"
                                className="block text-sm font-medium leading-6"
                              >
                                Sujet*
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="incidentSubject"
                                  id="incidentSubject"
                                  required
                                  value={incidentSubject}
                                  onChange={(e) =>
                                    setIncidentSubject(e.target.value)
                                  }
                                  className="block w-full rounded-md border-0 py-3 pl-3 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-6">
                              <label
                                htmlFor="incidentDescription"
                                className="block text-sm font-medium leading-6"
                              >
                                Description*
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="incidentDescription"
                                  name="incidentDescription"
                                  rows={4}
                                  required
                                  value={incidentDescription}
                                  onChange={(e) =>
                                    setIncidentDescription(e.target.value)
                                  }
                                  className="block w-full rounded-md border-0 py-2 pl-3 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                          onClick={resetForm}
                        >
                          Réinitialiser le formulaire
                        </button>
                        <button
                          type="submit"
                          className="block rounded-md px-3 py-2 text-center text-white text-sm bg-green-700 hover:bg-green-800"
                        >
                          Ajouter
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentAdd;
