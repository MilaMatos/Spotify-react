import './App.css';
import {useEffect, useState} from "react";
import axios from 'axios';

function App() {
  const CLIENT_ID = "dd5e13e5802c418d9f47614841ab86bc";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    setSearchKey("");
    setArtists([]);
    window.localStorage.removeItem("token");
  }

  const searchArtists = async (e) => {
    e.preventDefault();
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            q: searchKey,
            type: "artist"
        }
    });

    setArtists(data.artists.items);
  }

  const clearSearch = () => {
    setSearchKey("");
    setArtists([]);
  }

  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id} className="artist-card">
        {artist.images.length ? (
          <img className="artist-image" src={artist.images[0].url} alt={artist.name}/>
        ) : (
          <div className="no-image">No Image</div>
        )}
        <h2 className="artist-name">
          <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            {artist.name}
          </a>
        </h2>
        <p className="artist-genres"><strong>Gêneros:</strong> {artist.genres.length ? artist.genres.join(", ") : "Gênero não disponível"}</p>
      </div>
    ));
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React - Gêneros Musicais</h1>

        {!token ? (
          <a className="btn login-btn" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
            Login to Spotify
          </a>
        ) : (
          <div>
            <button className="btn logout-btn" onClick={logout}>
              Logout
            </button>
            <button className="btn clear-btn" onClick={clearSearch}>
              Clear
            </button>
          </div>
        )}
      
        {token && (
          <form onSubmit={searchArtists} className="search-form">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for an artist..." 
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
            />
            <button type="submit" className="btn search-btn">Search</button>
          </form>
        )}

        <div className="artist-grid">
          {renderArtists()}
        </div>
      
      </header>
    </div>
  );
}

export default App;
