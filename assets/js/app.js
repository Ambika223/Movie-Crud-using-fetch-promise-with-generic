const cl = console.log;

const showMovieBtn = document.getElementById('showMovieBtn');
const MovieContainer = document.getElementById('MovieContainer');
const backDrop = document.getElementById('backDrop');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const closeIcon = document.getElementById('closeIcon');
const movieTitle = document.getElementById('movieTitle');
const movieImg = document.getElementById('movieImg');
const createdAt = document.getElementById('createdAt');
const updatedAt = document.getElementById('updatedAt');
const movieDescription = document.getElementById('movieDescription');
const movieRating = document.getElementById('movieRating');
const date = document.getElementById('date');
const genre = document.getElementById('genre');
const submitMovieBtn = document.getElementById('submitMovieBtn');
const updateMovieBtn = document.getElementById('updateMovieBtn');
const closeBtn = document.getElementById('closeBtn');
const spinner = document.getElementById('spinner');

const base_url = `https://postcrud-81c16-default-rtdb.firebaseio.com`;
const movie_url = `${base_url}/movies.json`;

let state = {
    moviesArr: [],
    editId: null
}

function objToArr(obj) {
    for (const key in obj) {
        obj[key].id = key;
        state.moviesArr.unshift(obj[key]);
    }
}

function toggleFormBackdrop() {
    backDrop.classList.toggle('active');
    movieModal.classList.toggle('active');
    movieForm.reset();
    if (!movieModal.classList.contains("active")) {
        updateMovieBtn.classList.add('d-none');
        submitMovieBtn.classList.remove('d-none');
    }
}

function toggleSpinner() {
    spinner.classList.toggle('d-none');
}


function showUpdatedSmallElement(updateId) {
    let col = document.getElementById(updateId);
    let updatedSmallElement = col.querySelector('.updatedAt');
    updatedSmallElement.classList.remove('d-none');
}


function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 2000
    })
}
function setRating(rating) {
    if (rating > 8) {
        return " badge-success";
    }
    else if (rating >= 5) {
        return " badge-warning";
    }
    else {
        return " badge-danger";
    }
}

function makeAPICall(movie_url, methodType, msgbody = null) {
    let body = msgbody ? JSON.stringify(msgbody) : null;
    return fetch(movie_url, {
        method: methodType,
        body: body,
        headers: {
            "content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`error`);
            }
            return res.json();
        })

        .finally(() => {
            toggleSpinner();
        })
}




//READ
function renderMovie() {
    toggleSpinner();
    makeAPICall(movie_url, "GET")
        .then(res => {
            objToArr(res);
            renderingMovie(state.moviesArr);
        })
        .catch(err => {
            snackBar("error")
        })
}
renderMovie();

function renderingMovie(arr) {
    let res = ``;
    arr.forEach(movies => {
        res += `
        <div class='col-md-3' id="${movies.id}">
         <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${movies.movieTitle}</h3>
                                <div><small class="createAt">Created At:${movies.createdAt}</small></div>
                                <div><small class="updatedAt d-none">Updated At:${movies.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge${setRating(movies.movieRating)}">${movies.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${movies.movieImg}"
                                alt="${movies.movieTitle}">
                            <figcaption>
                                <h4>${movies.movieTitle}</h4>
                                <p>${movies.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
                </div>
        `
    })
    MovieContainer.innerHTML = res;
}


function onMovieAdd(eve) {
    eve.preventDefault();
    cl("ADD FUNCTION CALLED");
    let movie_obj = {
        movieTitle: movieTitle.value,
        movieImg: movieImg.value,
        createdAt: createdAt.value,
        updatedAt: updatedAt.value,
        movieDescription: movieDescription.value,
        movieRating: movieRating.value,
        date: date.value,
        genre: genre.value
    };
    cl(movie_obj);
    toggleSpinner();
    makeAPICall(movie_url, "POST", movie_obj)
        .then(res => {
            cl(res)
            movie_obj.id = res.name;
            state.moviesArr.unshift(movie_obj);
            createMovieCard(movie_obj);
            snackBar("Movie created successfully!", "success");
            toggleFormBackdrop();
        })
        .catch((err) => {
            snackBar("error")
        })

}

function createMovieCard(movie) {
    let div = document.createElement("div");
    div.id = movie.id;
    div.className = "col-md-3"
    div.innerHTML = `
      <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${movie.movieTitle}</h3>
                                <div><small class="createAt">Created At:${movie.createdAt}</small></div>
                                <div><small class="updatedAt d-none">Updated At:${movie.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge${setRating(movie.movieRating)}">${movie.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${movie.movieImg}"
                                alt="${movie.movieTitle}">
                            <figcaption>
                                <h4>${movie.movieTitle}</h4>
                                <p>${movie.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
    `
    MovieContainer.prepend(div);
}


//EDIT
function editMovie(ele) {
    let EDIT_ID = ele.closest('.col-md-3').id;
    state.editId = EDIT_ID;
    toggleFormBackdrop();
    let EDIT_OBJ = state.moviesArr.find(movie => movie.id === EDIT_ID);
    movieTitle.value = EDIT_OBJ.movieTitle;
    movieImg.value = EDIT_OBJ.movieImg;
    createdAt.value = EDIT_OBJ.createdAt;
    updatedAt.value = EDIT_OBJ.updatedAt;
    movieDescription.value = EDIT_OBJ.movieDescription;
    movieRating.value = EDIT_OBJ.movieRating;
    date.value = EDIT_OBJ.date;
    genre.value = EDIT_OBJ.genre;
    updateMovieBtn.classList.remove('d-none');
    submitMovieBtn.classList.add('d-none');

}

//UPDATE
function updateMovie() {
    let UPDATE_ID = state.editId;
    showUpdatedSmallElement(UPDATE_ID);
    let UPDATE_URL = `${base_url}/movies/${UPDATE_ID}.json`;
    let UPDATED_OBJ = {
        movieTitle: movieTitle.value,
        movieImg: movieImg.value,
        createdAt: createdAt.value,
        updatedAt: updatedAt.value,
        movieDescription: movieDescription.value,
        movieRating: movieRating.value,
        date: date.value,
        genre: genre.value,
        id: UPDATE_ID
    }
    toggleSpinner();
    makeAPICall(UPDATE_URL, "PATCH", UPDATED_OBJ)
        .then(res => {
            cl(res);
            let getIndex = state.moviesArr.findIndex(movie => movie.id === UPDATE_ID);
            state.moviesArr[getIndex] = UPDATED_OBJ;
            let div = document.getElementById(UPDATE_ID);
            div.innerHTML = `
      <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${UPDATED_OBJ.movieTitle}</h3>
                                <div><small class="createAt">Created At:${UPDATED_OBJ.createdAt}</small></div>
                                <div><small class="updatedAt d-none">Updated At:${UPDATED_OBJ.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge${setRating(UPDATED_OBJ.movieRating)}">${UPDATED_OBJ.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${UPDATED_OBJ.movieImg}"
                                alt="${UPDATED_OBJ.movieTitle}">
                            <figcaption>
                                <h4>${UPDATED_OBJ.movieTitle}</h4>
                                <p>${UPDATED_OBJ.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>`
            snackBar("Movie updated successfully!", "success");
            showUpdatedSmallElement(UPDATE_ID);
            toggleFormBackdrop();

        })
        .catch(err => {
            snackBar('error');
        })
}

//Remove
function removeMovie(ele) {
    let remove_Id = ele.closest('.col-md-3').id;
    const remove_url = `${base_url}/movies/${remove_Id}.json`;
    Swal.fire({
        title: "Are you sure, You want to delete this movie?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((res) => {
        if (res.isConfirmed) {
            toggleSpinner();
            makeAPICall(remove_url, "DELETE")
                .then(res => {
                    // cl(res)
                    let getIndex = state.moviesArr.findIndex(m => m.id === remove_Id);
                    state.moviesArr.splice(getIndex, 1);
                    ele.closest('.col-md-3').remove();
                    snackBar("Movie deleted Successfully", "success");
                })
                .catch(err => {
                    snackBar("error");
                })
        }
    });
}

movieForm.addEventListener("submit", onMovieAdd);
showMovieBtn.addEventListener('click', toggleFormBackdrop);
closeIcon.addEventListener('click', toggleFormBackdrop);
closeBtn.addEventListener('click', toggleFormBackdrop);
backDrop.addEventListener('click', toggleFormBackdrop);
updateMovieBtn.addEventListener('click', updateMovie);