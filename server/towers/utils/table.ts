export const getTeamNumberFromSeatNumber = (seatNumber?: number): number | undefined => {
  return typeof seatNumber !== "undefined" && seatNumber > 0 ? Math.floor((seatNumber - 1) / 2) + 1 : undefined;
};
