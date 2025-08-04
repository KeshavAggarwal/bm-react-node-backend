// Function to get the current date and time in IST
export const getISTDate = () => {
  const now = new Date();
  const istOffset = 330; // IST offset in minutes (UTC+5:30)
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  return istTime;
};
