export type GuestOrder = {
  guestId: string;
  moodText: string;
  difficulty: number;
};

export function createGuestOrder(guestId: string): GuestOrder {
  return {
    guestId,
    moodText: "",
    difficulty: 1,
  };
}
