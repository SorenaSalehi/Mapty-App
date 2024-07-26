"use strict";

//Elements ///////////////////////////////////////////////////////////////////////////////
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//new:
// creating classes

//Parent class (workout)
class Workout {
  clicks = 0;

  date = new Date();

  //tip:
  //Craet ID
  //In the realWorld we use the libraries for creating ID
  //But now we creat this manually
  id = (Date.now() + "").slice(-10);
  constructor(
    //The arquements are Common in every child
    coords,
    distance,
    duration
  ) {
    this.coords = coords; //[lat , lng]
    this.distance = distance; // in km
    this.duration = duration; //in min
  }

  //set description
  _setDescription() {
    //tip:

    //month array
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    //new:
    //creat description
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDay()}`;
  }
  _click() {
    this.clicks++;
  }
}

//Child class
//Running
class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPeac();
    this._setDescription();
  }

  //calc peac
  calcPeac() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

//Child class
//Cycling
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  //calc speed
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//Using the Architectoure

//calss App
class App {
  //Set the instanse varibles AND private
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;

  //tip:
  //We dont want to call this function manuelly
  //So  we put this here, because this function will imediatly call , right after the page loaded
  constructor() {
    //tip:these are the functions which run at the begening

    //getting position
    this._getPosition();

    //getting local storage
    this._getLocaleStorage();

    //tip:
    //We are using bind method because in Eventlistener , THIS keyword pointing to the DOM element(form)

    //submit
    form.addEventListener("submit", this._newWorkout.bind(this));

    //change field
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._goToPopup.bind(this));
  }

  //Adding capsulation Methods

  //get position
  _getPosition() {
    if (navigator.geolocation) {
      //Be sure that we dond get error on old browsers
      navigator.geolocation.getCurrentPosition(
        //tip:

        //load map
        this._loadMap.bind(this),

        function () {
          alert(`Could not get the location`);
        }
      );
    }
  }

  //load map
  _loadMap(position) {
    //latitude and alangitude
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    //set coords
    const coords = [latitude, longitude];

    //new:
    //third party library:
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
    //Map IS OUR OBJECT WHICH WE'R interested on

    // Map style
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //new:
    //Implementing more Marker
    this.#map.on("click", this._showForm.bind(this));

    //rendering after the load
    this.#workouts.forEach((work) => this._renderingWorkoutMarker(work));
  }

  //show from
  _showForm(mapE) {
    this.#mapEvent = mapE;
    //dsipaly Form
    form.classList.remove("hidden");
    //jump in the form
    inputDistance.focus();
  }

  //Hide the form + clear the form
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";

    //hide Form
    form.style.display = "none";
    form.classList.add("hidden");
    //put back  the display after 1 second
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  //toggle field
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputDistance.focus();
  }

  // New workout
  _newWorkout(e) {
    e.preventDefault();

    //Helper funcions
    const validInput = (...input) => input.every((inp) => Number.isFinite(inp));
    const allPositive = (...input) => input.every((inp) => inp > 0);

    //Get the data from form
    let type = inputType.value;
    let duration = +inputDuration.value;
    let distance = +inputDistance.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If data is valid
    //tip:
    //the type element in HTML have type attribute , So check that
    if (type === "running") {
      //If workout is running , create the running object
      let cadence = +inputCadence.value;
      let duration = +inputDuration.value;
      if (
        //check inputs
        !validInput(duration, distance, cadence) ||
        !allPositive(duration, distance, cadence)
      )
        return alert("Input are NOT valid ");

      //Add new workout to object array
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }

    if (type === "cycling") {
      const elevGain = +inputElevation.value;
      if (
        !validInput(duration, distance, elevGain) ||
        !allPositive(duration, distance)
      )
        return alert(" ");

      //Add new workout to object array
      workout = new Cycling([lat, lng], distance, duration, elevGain);
      this.#workouts.push(workout);
      console.log(workout);
    }

    //Render workout as marker
    this._renderingWorkoutMarker(workout);
    //Render workout on list
    this._renderingWorkout(workout);

    //Hide the form + clear the form
    this._hideForm();

    this._setLocaleStorage();
  }

  _renderingWorkoutMarker(workout) {
    //Adding new markers
    //For more option I have to use the documentation
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup(
          //tip:Adding option to popup
          {
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
          }
        )
      )
      .openPopup()
      .setPopupContent(
        `${workout.type === "running" ? "🏃" : "🚴"} ${workout.description}`
      );
  }

  //rendering workout
  _renderingWorkout(workout) {
    //tip:
    //Using the part which is Common
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃" : "🚴"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    //tip: toFixed is for rounding Number to 1 decimal place
    //Running part
    if (workout.type === "running") {
      html += `
       <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    //cycling part
    if (workout.type === "cycling") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🏔️</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    //WE need to insert html after form AND when a new one Created , the old one goin down
    form.insertAdjacentHTML("afterend", html);
  }

  //go to popup
  _goToPopup(e) {
    let workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;

    //findin currect workout
    let workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    //set view on map
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      Animat: true,
      pan: {
        duration: 1,
      },
    });
    workout._click();
  }

  //new:
  //set local storage
  _setLocaleStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  //new:
  //Getting the Storage as object
  _getLocaleStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;

    this.#workouts = data;

    //Rendering workout
    this.#workouts.forEach((work) => this._renderingWorkout(work));
  }

  //AN Public method
  //reset the local storage
  reset() {
    localStorage.removeItem("workouts");
    //reload
    location.reload();
  }
}

const map = new App();
