import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  cinemaId: {
    type: String,
    required: true,
  },
  cinemaName: {
    type: String,
    required: true,
  },
  incidentSubject: {
    type: String,
    required: true,
  },
  incidentDescription: {
    type: String,
    required: true,
  },
  incidentReportedAt: {
    type: Date,
    default: Date.now,
  },
  incidentReportedBy: {
    type: String,
    required: true,
  },
});

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
