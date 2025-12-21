// Function to get the current date and time in IST
export const getISTDate = () => {
  const now = new Date();
  const istOffset = 330; // IST offset in minutes (UTC+5:30)
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  return istTime;
};

export const fixToIST = (dbDate: Date) => {
  if (!dbDate) return null;

  // dbDate is currently treated as UTC, but it's actually IST
  // Subtract IST offset so Flutter parsing works correctly
  const correctedDate = new Date(dbDate.getTime() - (5 * 60 + 30) * 60 * 1000);

  return correctedDate.toISOString(); // send ISO string
}
