// src/utils/dateUtils.jsx
import { format } from "date-fns";

export const formatDateTime = (date) =>
  format(new Date(date), "dd.MM.yyyy HH:mm");

export const getCurrentDateTime = () =>
  format(new Date(), "yyyy-MM-dd'T'HH:mm");
