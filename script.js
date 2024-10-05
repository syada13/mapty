'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Base class
class Workout {
  date = new Date();
  id = Date.now() + " ".slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance // in km
    this.duration = duration; // in min

  }
}

//Child classes
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }

}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Project Architecture
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
        alert("Could not get your location.")
      });
  }

  _loadMap(currPosition) {
    const { latitude } = currPosition.coords;
    const { longitude } = currPosition.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this))
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const postiveNums = (...inputs) =>
      inputs.every(inp => inp > 0);

    e.preventDefault();


    // Get workout data from form.
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;



    // If workout is running, create Running class object
    if (type === "running") {
      const cadence = +inputCadence.value;

      if (!validInputs(distance, duration, cadence) ||
        !postiveNums(distance, duration, cadence))
        return alert("Please enter input numbers only.");

      workout = new Running([lat, lng], distance, duration, cadence);

    }

    // If workout is cycling , create Cycling class object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (!validInputs(distance, duration, elevation) ||
        !postiveNums(distance, duration))
        return alert("Please enter input numbers only.");

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }


    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as Marker
    this.renderWorkoutMarker(workout);

    // Render workout on the page list

    // Hide + clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords).addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();






