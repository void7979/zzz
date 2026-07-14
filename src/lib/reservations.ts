export const reservationStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];

export function isReservationStatus(value: string): value is ReservationStatus {
  return reservationStatuses.includes(value as ReservationStatus);
}

export const reservationStatusLabelsFa: Record<ReservationStatus, string> = {
  pending: "در انتظار",
  confirmed: "تأیید شده",
  completed: "انجام شده",
  cancelled: "لغو شده",
};

export const reservationStatusColors: Record<ReservationStatus, string> = {
  pending: "bg-[#c7a94e] text-[#15110f]",
  confirmed: "bg-[#89a86a] text-[#12100f]",
  completed: "bg-[#5b7c8d] text-[#ecdfc3]",
  cancelled: "bg-[#7c2f34] text-[#f3d7cb]",
};
