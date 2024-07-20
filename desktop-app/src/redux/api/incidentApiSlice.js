import { apiSlice } from "./apiSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const INCIDENT_URL = `${BASE_URL}/api/incidents`;

export const incidentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIncident: builder.mutation({
      query: (newIncident) => ({
        url: INCIDENT_URL,
        method: "POST",
        body: newIncident,
      }),
    }),

    getIncidents: builder.query({
      query: () => INCIDENT_URL,
      method: "GET",
    }),

    getIncidentDetails: builder.query({
      query: (id) => ({
        url: `${INCIDENT_URL}/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useCreateIncidentMutation,
  useGetIncidentsQuery,
  useGetIncidentDetailsQuery,
} = incidentApiSlice;
