const dateP = document.querySelector('#todays-date');
dateP.textContent = formatDate(new Date())

function formatDate(date) {
  const dateObj = new Date(date);
  return dateObj.toDateString();
}