"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
}

//Child class
//Running
class Running extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPeac();
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
  #workout = [];

  constructor() {
    //tip:
    //We dont want to call this function manuelly
    //So  we put this here, because this function will imediatly call , right after the page loaded
    this._getPosition();

    //tip:
    //We are using AGAING because in Eventlistener , THIS keyword pointing to the DOM element(form)
    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField);
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
    this.#map = L.map("map").setView(coords, 15);
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
      const cadence = +inputCadence.value;

      if (
        //tip:Instant of tihs , simply write a helper function
        // if(!Number.isFinite(type) || !Number.isFinite(duration) || !Number.isFinite(distance) || !Number.isFinite(cadence)) return

        !validInput(duration, distance, cadence) ||
        !allPositive(duration, distance, cadence)
      )
        return alert("Input are NOT valid ");

      //Add new workout to object array
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workout.push(workout);
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
      this.#workout.push(workout);
      console.log(workout);
    }

    //Render workout as marker
    this.renderingWorkoutMarker(workout);
    //Render workout on list

    //Hide the form + clear the form
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";

    form.classList.add("hidden");
  }

  renderingWorkoutMarker(workout) {
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
      .setPopupContent("WorkOut");
  }
}

const map = new App();
