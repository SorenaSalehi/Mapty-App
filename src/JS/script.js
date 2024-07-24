"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//Global variables
// let map, mapEvent;

//new:
//Geolocation api:
//this is a browser api
//Have 2 callback function :
//1.First one is executed when the browsers suuccesfully ge the coorden
//2.second one is executed when the browsers get error
// if (navigator.geolocation) {
//   //Be sure that we dond get error on old browsers
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       console.log(position);
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(latitude, longitude);

//       const coords = [latitude, longitude];

//       //new:
//       //third party library:
//       map = L.map("map").setView([latitude, longitude], 15);
//       //Map IS OUR OBJECT WHICH WE'R interested on
//       console.log(map);

//       //this is Map style
//       L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       //this is Marker
//       L.marker([latitude, longitude])
//         .addTo(map)
//         .bindPopup("A pretty CSS popup.<br> Easily customizable.")
//         .openPopup();

//       //new:
//       //Implementing more Marker
//       //tip:
//       //WE are using here the Leaflet methods NOT JS methods

//       map.on("click", function (mapE) {
//         console.log(mapE);
//         mapEvent = mapE;
//         //dsipaly Form
//         form.classList.remove("hidden");
//         //jump in the form
//         inputDistance.focus();
//       });
//     },
//     function () {
//       alert(`Could not get the location`);
//     }
//   );
// }

//Submit listener
//1.when user submit the form, Marker will be show
// form.addEventListener("submit", function (e) {
//   e.preventDefault();

//   //   //tip:
//   //         //in this Event listener we have many value , and one of these are the current coord that we click
//   //         //NOW we get the coord
//   const { lat, lng } = mapEvent.latlng;
//   console.log(lat, lng);

//   //         //Adding new markers
//   //         //For more option I ahve to use the documentation
//   L.marker({ lat, lng })
//     .addTo(map)
//     .bindPopup(
//       L.popup(
//         //tip:Adding option to popup
//         {
//           maxWidth: 250,
//           minWidth: 100,
//           autoClose: false,
//           closeOnClick: false,
//           className: "running-popup",
//         }
//       )
//     )
//     .openPopup()
//     .setPopupContent("WorkOut");

//   //Empty the form
//   inputCadence.value =
//     inputDistance.value =
//     inputDuration.value =
//     inputElevation.value =
//       "";

//       form.classList.add('hidden')
// });

//Submit listener
//change the input type to hidden
// inputType.addEventListener("change", function () {
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden')}
// )

//new:
// creating classes

//Parent class
class Workout {
  clicks = 0;

  date = new Date();

  //tip:
  //In the realWorld we use the libraries for creating ID
  //But now we creat this manually
  id = (Date.now() + "").slice(-10); //converting the date to String , than slicing the last 10 number
  constructor(
    coords,
    distance,
    duration //The arquements are Common in every child
  ) {
    this.coords = coords; //[lat , lng]
    this.distance = distance; // in km
    this.duration = duration; //in min
  }
  _setDescription() {
    //tip:
    //good thing is the array are ZERO base!
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
    //cause the getMonth method are zero base , we can the the exacly index from months Array!!!
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDay()}`;
  }
  _click() {
    this.clicks++;
    console.log(this.clicks);
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

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run = new Running([25,-89],15,20,500)
// const cycling = new Cycling([25,-29],25,20,50)
// console.log(run,cycling);

//fix:(Refactoring) //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Using the Architectoure

class App {
  //Set the instanse varibles AND private
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;

  constructor() {
    //tip:
    //We dont want to call this function manuelly
    //So  we put this here, because this function will imediatly call , right after the page loaded
    //tip:these are the thing which run at the begening
    this._getPosition();

    this._getLocaleStorage();

    //tip:
    //We are using AGAING because in Eventlistener , THIS keyword pointing to the DOM element(form)
    form.addEventListener("submit", this._newWorkout.bind(this));

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
        //If we the loadMap function as arqument this will be a simple funtion AND its hs NO THIS keyword
        //SO , we use the bind method to create a new function  and set the this keyword to that
        this._loadMap.bind(this),

        function () {
          alert(`Could not get the location`);
        }
      );
    }
  }

  //load map
  _loadMap(position) {
    console.log(position);
    //   //tip:
    //         //in this Event listener we have many value , and one of these are the current coord that we click
    //         //NOW we get the coord
    // const { lat, lng } = this.#mapEvent.latlng;

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(latitude, longitude);

    const coords = [latitude, longitude];

    //new:
    //third party library:
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
    //Map IS OUR OBJECT WHICH WE'R interested on

    //this is Map style
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //this is Marker
    // L.marker([latitude, longitude])
    //   .addTo(this.#map)
    //   .bindPopup("A pretty CSS popup.<br> Easily customizable.")
    //   .openPopup();

    //new:
    //Implementing more Marker
    //tip:
    //WE are using here the Leaflet methods NOT JS methods

    //tip: usnig bind
    this.#map.on("click", this._showForm.bind(this));

    //rendering after the load
    this.#workouts.forEach((work) => this._renderingWorkoutMarker(work));
  }

  //show from
  _showForm(mapE) {
    // console.log(mapE);
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
    //For hidde the class imediatly , we do this , because it have An animation
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
    //put the arquments in array
    //1.every method reurn bolean
    //2.inFinite method check the number or not
    const validInput = (...input) => input.every((inp) => Number.isFinite(inp));
    const allPositive = (...input) => input.every((inp) => inp > 0);

    //Get the data from form
    let type = inputType.value;
    //doing + because the value is String at first step
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
        //tip:Instant of tihs , simply write a helper function
        // if(!Number.isFinite(type) || !Number.isFinite(duration) || !Number.isFinite(distance) || !Number.isFinite(cadence)) return

        !validInput(duration, distance, cadence) ||
        !allPositive(duration, distance, cadence)
      )
        return alert("Input are NOT valid ");

      //Add new workout to object array
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
      console.log(workout);
    }

    if (type === "cycling") {
      //If workout is cycling , create the cycling object
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
    //         //Adding new markers
    //         //For more option I ahve to use the documentation
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

  _goToPopup(e) {
    let workoutEl = e.target.closest(".workout");
    console.log(workoutEl);
    if (!workoutEl) return;

    let workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      Animat: true,
      pan: {
        duration: 1,
      },
    });
    workout._click();
  }

  //new:
  //Locale Storage api , is a simple one
  //And accept 2 String
  //1. The Name
  //2. Second one we can use Json.stringify() ,which make everything to string
  //tip:because we HAVE to use locale storage for very small amoung data
  _setLocaleStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  } //now we can see it in Application on inspect

  //new:
  //Getting the Storage
  //Using JSON.parse() , for reurn the string to object

  _getLocaleStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    this.#workouts = data;

    //tip:
    //Good thing to using classes And functionality is this,that we now just use that method not copy or refactor All code
    this.#workouts.forEach((work) => this._renderingWorkout(work));
  }

  //AN Public method
  //which can clean the Local Storage

  reset() {
    localStorage.removeItem("workouts");
    //and An method for raload the page
    location.reload();
  } //now we can can use this on map variable in code or console
}

const map = new App();
