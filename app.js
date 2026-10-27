
const beats = [
  { id: "beat1", name: "BEAT ONE", genre: "Melodic / Trap", file: "/songs/beat1.mp3" },
  { id: "beat2", name: "BEAT TWO", genre: "Drill / Dark", file: "/songs/beat2.mp3" },
  { id: "beat3", name: "BEAT THREE", genre: "R&B / Smooth", file: "/songs/beat3.mp3" },
  { id: "beat4", name: "BEAT FOUR", genre: "Trap / Hard", file: "/songs/beat4.mp3" },
  { id: "beat5", name: "BEAT FIVE", genre: "Melodic / Emotional", file: "/songs/beat5.mp3" }
];

const prices = {
  basic: 29.99,
  premium: 59.99,
  unlimited: 99.99
};

const grid = document.querySelector("#beat-grid");
const dialog = document.querySelector("#checkout");
let selectedBeat = null;

beats.forEach((beat, index) => {
  const card = document.createElement("article");
  card.className = "beat-card";

  const number = document.createElement("div");
  number.className = "beat-number";
  number.textContent = `PRODUCTION / 0${index + 1}`;

  const title = document.createElement("h3");
  title.textContent = beat.name;

  const genre = document.createElement("p");
  genre.textContent = beat.genre;

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = beat.file;
  audio.setAttribute("aria-label", `Preview ${beat.name}`);

  const button = document.createElement("button");
  button.className = "buy";
  button.textContent = "CHOOSE LICENCE ↗";
  button.addEventListener("click", () => openCheckout(beat));

  card.append(number, title, genre, audio, button);
  grid.append(card);
});

function openCheckout(beat) {
  selectedBeat = beat;
  document.querySelector("#checkout-title").textContent = beat.name;
  updatePrice();
  document.querySelector("#payment-message").textContent =
    "Select a licence. Payment will be available after checkout setup.";
  dialog.showModal();
}

function updatePrice() {
  const licence = document.querySelector("#licence").value;
  document.querySelector("#checkout-price").textContent =
    `€${prices[licence].toFixed(2)} — ${licence.toUpperCase()} LICENCE`;
}

document.querySelector("#licence").addEventListener("change", updatePrice);

document.querySelector("#close-checkout").addEventListener("click", () => {
  dialog.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();
