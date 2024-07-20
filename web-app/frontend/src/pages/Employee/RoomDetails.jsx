import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PhotoIcon } from "@heroicons/react/24/outline";
import LoaderFull from "../../components/LoaderFull";

import { useGetRoomQuery } from "../../redux/api/roomApiSlice";

const RoomDetails = () => {
  const { id } = useParams();

  const { data: room, isLoading, error, refetch } = useGetRoomQuery(id);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch room details.");
    }
  }, [error]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <LoaderFull />;

  return (
    <>
      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mx-auto">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Room n°{room.roomNumber}
                  </h1>
                  <NavLink
                    to="/admin/roomlist"
                    className="text-center pb-2 border-b-2 text-sm font-semibold shadow-sm hover:text-gray-400 hover:border-gray-400"
                  >
                    Go back
                  </NavLink>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="min-w-full divide-y divide-gray-300">
                      <form>
                        <div className="space-y-12">
                          <div>
                            <div className="mt-6 border-t border-gray-100">
                              <dl className="divide-y divide-gray-100">
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    ID
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    {room.id}
                                  </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    Room Number
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    {room.roomNumber}
                                  </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    Cinema
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    <h3 className="font-semibold">Name</h3>
                                    <div>{room.cinema.cinemaName}</div>

                                    <h3 className="font-semibold">Email</h3>
                                    <div>{room.cinema.cinemaEmail}</div>

                                    <h3 className="font-semibold">Address</h3>
                                    <div>
                                      {room.cinema.cinemaAddress}{" "}
                                      {room.cinema.cinemaPostalCode}{" "}
                                      {room.cinema.City} {room.cinema.Country}{" "}
                                    </div>
                                    <h3 className="font-semibold">
                                      Telephone Number
                                    </h3>
                                    <div>{room.cinema.cinemaTelNumber}</div>
                                    <h3 className="font-semibold">
                                      Opening Hours
                                    </h3>

                                    <div>
                                      {room.cinema.cinemaStartTimeOpening} -{" "}
                                      {room.cinema.cinemaEndTimeOpening}
                                    </div>
                                  </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    Capacity
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    {room.roomCapacity}
                                  </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    Quality
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    {room.roomQuality}
                                  </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                  <dt className="text-sm font-medium leading-6">
                                    Number of Active Sessions
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                    {
                                      room.sessions.filter(
                                        (session) =>
                                          session.sessionStatus === "ACTIVE"
                                      ).length
                                    }
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
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
    </>
  );
};

export default RoomDetails;
