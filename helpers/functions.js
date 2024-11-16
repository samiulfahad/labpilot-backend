/** @format */

const generateInvoiceId = () => {
  // Get the current date and time
  const now = new Date();

  // Format the time as HH:MM:SS
  const timeString = now.toTimeString().split(" ")[0]; // Extract time part
  console.log("Time (HH:MM:SS):", timeString);

  // Format with date and time (YYYY-MM-DD HH:MM:SS)
  const id = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(
    2,
    "0"
  )}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
  return id;
};

const generateDate = () => {
  const suffixes = ["th", "st", "nd", "rd"];
  const now = new Date();

  // Get the day of the month
  const day = now.getDate();

  // Determine the correct suffix
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? suffixes[1]
      : day % 10 === 2 && day % 100 !== 12
      ? suffixes[2]
      : day % 10 === 3 && day % 100 !== 13
      ? suffixes[3]
      : suffixes[0];

  // Get the full month name
  const month = now.toLocaleString("default", { month: "long" });

  // Get the year
  const year = now.getFullYear();

  // Format the date
  return `${day}${suffix} ${month} ${year}`;
};

module.exports = { generateInvoiceId, generateDate };
