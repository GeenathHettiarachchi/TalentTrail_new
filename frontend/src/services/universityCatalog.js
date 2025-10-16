// src/services/universityCatalog.js
import axios from "axios";

/**
 * A tiny service that hits your backend/proxy for Sri Lankan
 * UNDERGRADUATE academic data. These are read-only endpoints.
 *
 * Expected backend:
 *   GET /academics/lk/universities?q=colom
 *     -> [{ name: "University of Colombo" }, ...]
 *   GET /academics/lk/faculties?university=University%20of%20Colombo
 *     -> [{ name: "Faculty of Science" }, ...]
 *   GET /academics/lk/programs?university=University%20of%20Colombo&faculty=Faculty%20of%20Science&level=ug
 *     -> [{ name: "BSc in Computer Science" }, ...]
 *
 * If your backend returns different shapes, the tolerant mappers below
 * will still try to coerce them into { name }.
 */
const api = axios.create({
  baseURL: "/api",
});

const toArray = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.content)
    ? data.content
    : [];

const toNameObjects = (arr) =>
  arr.map((x) => (typeof x === "string" ? { name: x } : x?.name ? x : { name: String(x) }));

export const academicService = {
  async searchUniversitiesLK(q) {
    const { data } = await api.get("/academics/lk/universities", { params: { q } });
    return toNameObjects(toArray(data));
  },
  async getFacultiesLK(university) {
    const { data } = await api.get("/academics/lk/faculties", { params: { university } });
    return toNameObjects(toArray(data));
  },
  async getProgramsLK(university, faculty, level = "ug") {
    const { data } = await api.get("/academics/lk/programs", {
      params: { university, faculty, level },
    });
    return toNameObjects(toArray(data));
  },
};
