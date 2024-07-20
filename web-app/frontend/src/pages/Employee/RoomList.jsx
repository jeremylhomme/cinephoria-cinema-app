import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../../redux/api/roomApiSlice";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";
import { useUpdateSeatMutation } from "../../redux/api/seatApiSlice";
import { MdWheelchairPickup } from "react-icons/md";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

const RoomList = () => {
  const {
    data: rooms,
    refetch: refetchRooms,
    isLoading: roomsLoading,
    error: roomsError,
  } = useGetRoomsQuery();
  const {
    data: cinemas,
    isLoading: cinemasLoading,
    error: cinemasError,
  } = useGetCinemasQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [updateSeat] = useUpdateSeatMutation();

  const [roomPmrSeats, setRoomPmrSeats] = useState({});

  const [editableRoomId, setEditableRoomId] = useState(null);
  const [editableRoomNumber, setEditableRoomNumber] = useState("");
  const [editableRoomCapacity, setEditableRoomCapacity] = useState("");
  const [editableRoomQuality, setEditableRoomQuality] = useState("");

  const [newRoomInputs, setNewRoomInputs] = useState({});

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [pmrSeats, setPmrSeats] = useState([]);

  useEffect(() => {
    if (rooms) {
      const initialRoomPmrSeats = {};
      const initialPmrSeats = [];
      rooms.forEach((room) => {
        initialRoomPmrSeats[room.id] = room.seats
          .filter((seat) => seat.pmrSeat)
          .map((seat) => seat.id);
        initialPmrSeats.push(
          ...room.seats.filter((seat) => seat.pmrSeat).map((seat) => seat.id)
        );
      });
      setRoomPmrSeats(initialRoomPmrSeats);
      setPmrSeats(initialPmrSeats);
    }
  }, [rooms]);

  useEffect(() => {}, [selectedSeats, pmrSeats]);

  const toggleEdit = (id, roomNumber, roomCapacity, roomQuality) => {
    setEditableRoomId(id);
    setEditableRoomNumber(roomNumber);
    setEditableRoomCapacity(roomCapacity);
    setEditableRoomQuality(roomQuality);
  };

  const saveHandler = async (cinemaId) => {
    const { newRoomNumber, newRoomCapacity, newRoomQuality } =
      newRoomInputs[cinemaId] || {};

    if (!newRoomNumber || !newRoomCapacity || !newRoomQuality) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    try {
      await createRoom({
        roomNumber: parseInt(newRoomNumber),
        cinemaId: parseInt(cinemaId),
        roomCapacity: parseInt(newRoomCapacity),
        roomQuality: newRoomQuality,
      }).unwrap();
      setNewRoomInputs((prev) => ({
        ...prev,
        [cinemaId]: {
          newRoomNumber: "",
          newRoomCapacity: "",
          newRoomQuality: "",
        },
      }));
      refetchRooms();
      toast.success("Salle ajoutée avec succès !");
    } catch (err) {
      console.log(err);
      toast.error(
        `Impossible d'ajouter la salle : ${err.data?.message || err.status}`
      );
    }
  };

  const updateHandler = async (id) => {
    try {
      const updatedRoom = {
        id: id,
        roomNumber: parseInt(editableRoomNumber),
        roomCapacity: parseInt(editableRoomCapacity),
        roomQuality: editableRoomQuality,
      };

      await updateRoom(updatedRoom).unwrap();
      setEditableRoomId(null);
      refetchRooms();
      toast.success("Salle a été mise à jour avec succès !");
    } catch (err) {
      toast.error(`Failed to update room: ${err.data?.message || err.error}`);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Etes-vous sûr de vouloir supprimer cette salle?")) {
      try {
        const roomId = Number(id);
        if (isNaN(roomId)) {
          toast.error("Invalid ID: Deletion not performed.");
          return;
        }
        await deleteRoom(roomId).unwrap();
        refetchRooms();
        toast.success("Salle supprimée avec succès!");
      } catch (err) {
        toast.error(
          "Une erreur s'est produite lors de la suppression de la salle. Veuillez réessayer plus tard."
        );
        console.error("Deletion error:", err);
      }
    }
  };

  const togglePmrSeat = (seatId) => {
    setPmrSeats((prevPmrSeats) => {
      if (prevPmrSeats.includes(seatId)) {
        return prevPmrSeats.filter((id) => id !== seatId);
      } else {
        return [...prevPmrSeats, seatId];
      }
    });

    setRoomPmrSeats((prevRoomPmrSeats) => {
      const roomId = rooms.find((room) =>
        room.seats.some((seat) => seat.id === seatId)
      )?.id;
      if (roomId) {
        return {
          ...prevRoomPmrSeats,
          [roomId]: prevRoomPmrSeats[roomId].includes(seatId)
            ? prevRoomPmrSeats[roomId].filter((id) => id !== seatId)
            : [...prevRoomPmrSeats[roomId], seatId],
        };
      }
      return prevRoomPmrSeats;
    });

    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((id) => id !== seatId);
      } else {
        return [...prevSelectedSeats, seatId];
      }
    });
  };

  const savePmrSeats = async (roomId) => {
    try {
      const seatsToUpdate = pmrSeats.map((seatId) => {
        const isPmr = pmrSeats.includes(seatId);
        return updateSeat({
          seatId,
          updatedSeat: { pmrSeat: isPmr },
        }).unwrap();
      });

      const seatsToUnsetPmr = selectedSeats
        .filter((seatId) => !pmrSeats.includes(seatId))
        .map((seatId) => {
          return updateSeat({
            seatId,
            updatedSeat: { pmrSeat: false },
          }).unwrap();
        });

      await Promise.all([...seatsToUpdate, ...seatsToUnsetPmr]);

      refetchRooms();
      toast.success("Sièges PMR mis à jour avec succès.");
    } catch (error) {
      console.error("Error updating PMR seats:", error);
      toast.error("Failed to update PMR seats.");
    }
  };

  const renderSeat = (seat) => {
    const isPmr = seat.pmrSeat;

    let backgroundColor = "bg-gray-600";
    if (selectedSeats.includes(seat.id)) {
      backgroundColor = "bg-blue-600";
    } else if (isPmr) {
      backgroundColor = "bg-blue-600";
    }

    const isCurrentlyPmr = pmrSeats.includes(seat.id) || seat.pmrSeat;

    return (
      <div
        key={seat.id}
        className={`h-7 w-7 text-white text-xs rounded-tl-lg rounded-tr-lg mx-0.5 cursor-pointer flex flex-col items-center justify-center ${backgroundColor}`}
        onClick={() => togglePmrSeat(seat.id)}
      >
        <span>{seat.seatNumber}</span>
        {isCurrentlyPmr && <MdWheelchairPickup size={14} />}
      </div>
    );
  };

  const renderSeats = (seats, roomCapacity, roomId) => {
    const seatsPerRow = 10;
    const totalRows = Math.ceil(seats.length / seatsPerRow);

    const seatGrid = Array.from({ length: totalRows }, () =>
      Array(seatsPerRow).fill(null)
    );

    seats.forEach((seat) => {
      const seatNumber = parseInt(seat.seatNumber, 10) - 1;
      const row = Math.floor(seatNumber / seatsPerRow);
      const col = seatNumber % seatsPerRow;

      seatGrid[row][col] = seat;
    });

    const roomPmrCount = roomPmrSeats[roomId]?.length || 0;

    if (roomsLoading || cinemasLoading) {
      return <Loader />;
    }

    if (roomsError || cinemasError) {
      return <p>Error loading data. Please try again later.</p>;
    }

    return (
      <div className="flex flex-col items-start">
        {seatGrid.map((row, rowIndex) => {
          const actualSeatsInRow = row.filter((seat) => seat !== null).length;
          const leftPadding = Math.floor((seatsPerRow - actualSeatsInRow) / 2);
          const rightPadding = seatsPerRow - actualSeatsInRow - leftPadding;

          return (
            <div key={rowIndex} className="flex justify-center my-1">
              {Array.from({ length: leftPadding }).map((_, index) => (
                <div key={`left-${index}`} className="h-7 w-7 mx-0.5"></div>
              ))}
              {row.map((seat, colIndex) => (
                <div key={colIndex} className="mx-0.5">
                  {seat ? (
                    renderSeat(seat)
                  ) : (
                    <div className="h-7 w-7 mx-0.5"></div>
                  )}
                </div>
              ))}
              {Array.from({ length: rightPadding }).map((_, index) => (
                <div key={`right-${index}`} className="h-7 w-7 mx-0.5"></div>
              ))}
            </div>
          );
        })}
        <div className="w-full mt-4">
          <svg
            viewBox="0 0 800 80"
            preserveAspectRatio="xMidYMid meet"
            className="block w-96 h-auto"
          >
            <path
              d="M0 30 Q400 70 800 30"
              stroke="black"
              strokeWidth="3"
              fill="none"
            />
            <text x="400" y="25" textAnchor="middle" fontSize="30" fill="black">
              Écran
            </text>
          </svg>
        </div>
        <div className="mt-4">
          <p className="text-sm mb-3 text-center">
            <span className="text-blue-600">{roomPmrCount}</span> sièges sont
            sélectionnés pour les PMR.
          </p>

          <div className="flex">
            <button
              onClick={() => savePmrSeats(roomId)}
              className={`mt-4 block rounded-md px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-600`}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="py-16">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">
                Salles
              </h1>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6 lg:px-8">
              {cinemas && cinemas.length > 0 ? (
                cinemas.map((cinema) => (
                  <div key={cinema.id} className="mt-8">
                    <h2 className="text-2xl font-semibold">
                      {cinema.cinemaName}
                    </h2>
                    <div className="mt-4 flow-root">
                      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="bg-white mt-6 mb-8 inline-block min-w-full py-2 align-middle box-border border border-solid rounded-md border-[#e5e7eb] sm:px-6 lg:px-8">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                                >
                                  ID
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                                >
                                  Numéro de salle
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                                >
                                  Capacité
                                </th>
                                <th
                                  scope="col"
                                  className="pr-3 py-3.5 text-left text-sm font-semibold"
                                >
                                  Qualité
                                </th>
                                <th
                                  scope="col"
                                  className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                                >
                                  <span className="sr-only">Modifier</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {rooms && rooms.length > 0 ? (
                                rooms
                                  .filter(
                                    (room) => room.cinema.id === cinema.id
                                  )
                                  .map((room) => (
                                    <React.Fragment key={room.id}>
                                      <tr>
                                        <td className="whitespace-nowrap py-5 text-sm">
                                          {room.id}
                                        </td>
                                        <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                          {editableRoomId === room.id ? (
                                            <div className="flex items-center">
                                              <input
                                                type="text"
                                                value={editableRoomNumber}
                                                onChange={(e) =>
                                                  setEditableRoomNumber(
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Numéro de salle"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex items-center">
                                              <div className="font-medium">
                                                {room.roomNumber}
                                              </div>
                                            </div>
                                          )}
                                        </td>
                                        <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                          {editableRoomId === room.id ? (
                                            <div className="flex items-center">
                                              <input
                                                type="text"
                                                value={editableRoomCapacity}
                                                onChange={(e) =>
                                                  setEditableRoomCapacity(
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Capacité"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex items-center">
                                              <div className="font-medium">
                                                {room.roomCapacity}
                                              </div>
                                            </div>
                                          )}
                                        </td>
                                        <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                          {editableRoomId === room.id ? (
                                            <div className="flex items-center">
                                              <input
                                                type="text"
                                                value={editableRoomQuality}
                                                onChange={(e) =>
                                                  setEditableRoomQuality(
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Qualité"
                                                className="w-full p-2 border rounded-lg text-sm"
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex items-center">
                                              <div className="font-medium">
                                                {room.roomQuality}
                                              </div>
                                            </div>
                                          )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm">
                                          {editableRoomId === room.id ? (
                                            <div className="flex items-center space-x-2">
                                              <button
                                                onClick={() =>
                                                  updateHandler(room.id)
                                                }
                                                className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                                              >
                                                Sauvegarder
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setEditableRoomId(null)
                                                }
                                                className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                                              >
                                                Annuler
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2">
                                              <button
                                                onClick={() =>
                                                  toggleEdit(
                                                    room.id,
                                                    room.roomNumber,
                                                    room.roomCapacity,
                                                    room.roomQuality
                                                  )
                                                }
                                                className="hover:text-gray-400"
                                              >
                                                <PencilSquareIcon className="h-5 w-5" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  deleteHandler(room.id)
                                                }
                                                className="hover:text-gray-400"
                                              >
                                                <TrashIcon className="h-5 w-5" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td colSpan="5">
                                          <div className="max-w-7xl">
                                            <div className="relative mb-5">
                                              <div className="flex flex-col">
                                                <Disclosure>
                                                  {({ open }) => (
                                                    <>
                                                      <DisclosureButton className="py-2">
                                                        {open ? (
                                                          <p className="w-fit mt-4 mb-4 block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300">
                                                            Masquer plan de
                                                            salle
                                                          </p>
                                                        ) : (
                                                          <p className="w-fit block rounded-md px-3 py-2 mt-4 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-green-700 text-white">
                                                            Afficher plan de
                                                            salle
                                                          </p>
                                                        )}
                                                      </DisclosureButton>
                                                      <DisclosurePanel>
                                                        {renderSeats(
                                                          room.seats,
                                                          room.roomCapacity,
                                                          room.id
                                                        )}
                                                      </DisclosurePanel>
                                                    </>
                                                  )}
                                                </Disclosure>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="text-center py-5 text-sm text-gray-500"
                                  >
                                    Ajoutez une salle pour ce cinéma.
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                  <label
                                    className="text-gray-700 font-medium"
                                    htmlFor="id"
                                  >
                                    ID
                                  </label>
                                </td>
                                <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                  <input
                                    type="text"
                                    value={
                                      newRoomInputs[cinema.id]?.newRoomNumber ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      setNewRoomInputs((prev) => ({
                                        ...prev,
                                        [cinema.id]: {
                                          ...prev[cinema.id],
                                          newRoomNumber: e.target.value,
                                        },
                                      }));
                                    }}
                                    placeholder="Numéro de salle"
                                    className="w-full p-2 border rounded-lg text-sm"
                                  />
                                </td>
                                <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                  <input
                                    type="text"
                                    value={
                                      newRoomInputs[cinema.id]
                                        ?.newRoomCapacity || ""
                                    }
                                    onChange={(e) => {
                                      setNewRoomInputs((prev) => ({
                                        ...prev,
                                        [cinema.id]: {
                                          ...prev[cinema.id],
                                          newRoomCapacity: e.target.value,
                                        },
                                      }));
                                    }}
                                    placeholder="Capacité"
                                    className="w-full p-2 border rounded-lg text-sm"
                                  />
                                </td>
                                <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                  <input
                                    type="text"
                                    value={
                                      newRoomInputs[cinema.id]
                                        ?.newRoomQuality || ""
                                    }
                                    onChange={(e) => {
                                      setNewRoomInputs((prev) => ({
                                        ...prev,
                                        [cinema.id]: {
                                          ...prev[cinema.id],
                                          newRoomQuality: e.target.value,
                                        },
                                      }));
                                    }}
                                    placeholder="Qualité"
                                    className="w-full p-2 border rounded-lg text-sm"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-5 text-sm">
                                  <button
                                    onClick={() => saveHandler(cinema.id)}
                                    className={`block rounded-md px-3 py-2 text-center text-sm ${
                                      newRoomInputs[cinema.id]?.newRoomNumber &&
                                      newRoomInputs[cinema.id]
                                        ?.newRoomCapacity &&
                                      newRoomInputs[cinema.id]?.newRoomQuality
                                        ? "bg-green-700 text-white hover:bg-green-800"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                                    disabled={
                                      !newRoomInputs[cinema.id]
                                        ?.newRoomNumber ||
                                      !newRoomInputs[cinema.id]
                                        ?.newRoomCapacity ||
                                      !newRoomInputs[cinema.id]?.newRoomQuality
                                    }
                                  >
                                    Ajouter
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-center mt-8">
                    Aucun cinéma trouvé. Veuillez d'abord{" "}
                    <span className="text-green-700 underline">
                      <a href="/admin/cinema-list">ajouter un cinéma</a>
                    </span>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RoomList;
