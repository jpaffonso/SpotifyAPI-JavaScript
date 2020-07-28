// API module (iffe) - this function wil fire immediatelly
const APIController = (function() {
    
    // declaration of two variables
    const clientId = '5ea95f2fb21a47f8831e7153afa11e7b';
    const clientSecret = 'de1d4aae55dd4d5fa4ca4bb8d664a076';

    // private methods
    const _getToken = async () => {

        // we use the js fetching API method to call the Spotify token endpoint
        const result = await fetch('https://accounts.spotify.com/api/token', {
            // we make use of POST request
            method: 'POST',
            headers: {
                // specifying the required Content-Type
                'Content-Type' : 'application/x-www-form-urlencoded',
                // and Authorization parameter with a value of 'Basic' +  base64 encoded string representation of the Client ID and Client Secret
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            // we supply a parameter called grant_type that has a value of client_credentials that will wait data from that endpoint, place it in a variable called result and we then convert that data to JSON. The conversion method will also return a promisse.
            body: 'grant_type=client_credentials'
        });
        // In terms we await the JSON result, finally we store that JSON result into a variable called data.
        const data = await result.json();
        // and specifically return the access_token property from JSON data. We will be able to use that bearer token to call a Spotify endpoint giving us actual playlists
        return data.access_token;
    }
    
    // method to get a list of genres. It receives a token parameter because we need to supply the token Spotify provided to us in each API call. This function will return a promise as denoted by the async keyword.
    const _getGenres = async (token) => {
        // we use the JavaScript fetch method to call the Spotify category's API
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            // we make use of GET request (SPotify documentation)
            method: 'GET',
            // and we are to pass a bearer token along the way in the request header
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        // once we receive the result from the spotify we will convert to JSON which will also return a promise. In term we await that conversion and store the data in the variable called data
        const data = await result.json();
        // finally we return the items array store on the categories object
        return data.categories.items;
    }

    // method to get a list of playlist based on a given genre, which receives a token parameter and and a genreId parameter
    const _getPlaylistByGenre = async (token, genreId) => {
        // we create a variable to hold the limit on the amount of playlist we want to receive
        const limit = 10;
        // we use the JavaScript fetch method to call the Spotify category's playlist endpoint appling both the genreID and limit
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            // additionally supplying  the requested header information
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        // once we receive the result from the spotify, we will convert to JSON which will also return a promise. In term we await that conversion and store the data in the variable called data
        const data = await result.json();
        // finally we return the items array store on the playlist object
        return data.playlists.items;
    }
    // method to get a list of tracks based on a given playlist, which receives a token parameter and and a tracksEndPoint parameter. tracksEndPoint is included in the data set we retrieved when we first pull the playlist. So in terms when the user selects a playlist we will be able to access the tracks API endpoint attached to the playlist object
    const _getTracks = async (token, tracksEndPoint) => {
        // we declare a limit
        const limit = 10;
        // we pass the tracksEndPoint and limit to the fetch call
        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            // we make use of GET request (Spotify documentation)
            method: 'GET',
            // we supply the token await the results from the fetch call
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        // wait the JSON conversion
        const data = await result.json();
        // finally return the items array object
        return data.items;
    }
    // the last part of the mothod will get the actual selected track. Eventually we will be able to display all the tracks in a list group and the user will be able to select a specific track to view details. This method will receive a token and a trackEndPoint 
    const _getTrack = async (token, trackEndPoint) => {
        // we pass the tracksEndPoint to the fetch call
        const result = await fetch(`${trackEndPoint}`, {
            // we make use of GET request (Spotify documentation)
            method: 'GET',
            // we supply the token await the results from the fetch call
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        // wait the JSON data conversion
        const data = await result.json();
        // and finally return that json object
        return data;
    }
    // methods we want to exposed to outside scope. 
    // we are using closure because the publicly declared getToken method has access to the privatelly implemented _getToken method. These public methods will be caught in out main app module
    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();


// UI Module
const UIController = (function() {

    // object to hold references to html selectors. We do this to avoid having to type the specifics a letter name multiple times as we code. If happen to update an ID or a class name in the html file we'll only need to update it once in the js file
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list'
    }

    //public methods that will eventually be called by our main controler
    return {

        //method to get input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // need methods to create select list option
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // need method to create a track list group item 
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        // need method to create the song detail
        createTrackDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // any time user clicks a new song, we need to clear out the song detail div
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">        
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">${title}:</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();
// main module wich utilizes UI and API modules
const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // get genres on page load
    const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    // create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {
        //reset the playlist
        UICtrl.resetPlaylist();
        //get the token that's stored on the page
        const token = UICtrl.getStoredToken().token;        
        // get the genre select field
        const genreSelect = UICtrl.inputField().genre;       
        // get the genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // ge the playlist based on a genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        // create a playlist list item for every playlist returned
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });
     

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        // clear tracks
        UICtrl.resetTracks();
        //get the token
        const token = UICtrl.getStoredToken().token;        
        // get the playlist field
        const playlistSelect = UICtrl.inputField().playlist;
        // get track endpoint based on the selected playlist
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // get the list of tracks
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        // create a track list item
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name))
        
    });

    // create song selection click event listener
    DOMInputs.tracks.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        UICtrl.resetTrackDetail();
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = e.target.id;
        //get the track object
        const track = await APICtrl.getTrack(token, trackEndpoint);
        // load the track details
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });    

    return {
        init() {
            console.log('App is starting');
            loadGenres();
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();




