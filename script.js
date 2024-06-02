const cohortName = "2403-ftb-et-web-pt";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;

const state = {
  players: []
};

/**
 * Fetches all players from the API.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    state.players = data.data.players;
    renderAllPlayers(state.players);
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 */
const addNewPlayer = async (playerObj) => {
  try {
    const now = new Date().toISOString();
    playerObj.createdAt = now;
    playerObj.updatedAt = now;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playerObj)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const newPlayer = await response.json();
    await fetchAllPlayers();
    return newPlayer;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    await fetch(`${API_URL}/${playerId}`, {
      method: "DELETE",
    });
    await fetchAllPlayers();
  } catch (err) {
    console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
  }
};

/**
 * Updates `<main>` to display a list of all players.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  const playersContainer = document.getElementById("players-container");

  if (!playerList || playerList.length === 0) {
    playersContainer.innerHTML = "<h3>No players found.</h3>";
    return;
  }

  // Resets HTML of all players
  playersContainer.innerHTML = "";

  // Creates a card for each player
  playerList.forEach((player) => {
    const playerElement = document.createElement("div");
    playerElement.classList.add("player-card");
    playerElement.innerHTML = `
      <img src="${player.imageUrl}" alt="${player.name}">
      <h3>${player.name}</h3>
      <p>Breed: ${player.breed}</p>
      <p>Status: ${player.status}</p>
      <p>Team ID: ${player.teamID}</p>
      <p>Cohort ID: ${player.cohortID}</p>
      <p>Created At: ${player.createdAt}</p>
      <p>Updated At: ${player.updatedAt}</p>
      <button class="delete-button" data-id="${player.id}">Remove</button>
    `;
    playersContainer.appendChild(playerElement);

    // Add Event Listener to the delete button (click)
    const deleteButton = playerElement.querySelector(".delete-button");
    deleteButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const playerId = event.target.getAttribute("data-id");
      try {
        await removePlayer(playerId);
      } catch (error) {
        console.error(error);
      }
    });
  });
};

//Add Event Listener to the form (submit)
const addListenerToForm = () => {
  const form = document.querySelector("#new-player-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const playerObj = {
      name: form.name.value,
      imageUrl: form.imageUrl.value,
      breed: form.breed.value,
      status: form.status.value,
      teamID: parseInt(form.teamID.value),
      cohortID: parseInt(form.cohortID.value),
    };

    await addNewPlayer(playerObj);
    form.reset();
  });
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  try {
    await fetchAllPlayers();
    addListenerToForm();
  } catch (error) {
    console.error("Failed to initialize the app:", error);
  }
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}