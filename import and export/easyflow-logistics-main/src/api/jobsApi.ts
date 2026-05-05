import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// GET
export const fetchJobs = () => API.get("/get-jobs");

// CREATE
export const createJob = (data: any) => API.post("/add-job", data);

// UPDATE
export const updateJob = (id: string, data: any) =>
  API.put(`/update-job/${id}`, data);

// DELETE
export const deleteJob = (id: string) =>
  API.delete(`/delete-job/${id}`);