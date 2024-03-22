import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import "./App.css";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import axios from "axios";

type GoogleSearchItem = {
  title: string;
  link: string;
  image: { byteSize: number };
};

type GoogleSearchResponse = {
  items?: GoogleSearchItem[];
  spelling?: { correctedQuery?: string };
  searchInformation?: { formattedSearchTime?: string };
};

type FavoriteImage = {
  url: string;
};

type ImageData = {
  title: string;
  byteSize: number;
  url: string;
};

const App = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const [images, setImages] = useState<ImageData[]>([]);
  const [query, setQuery] = useState("");
  const [searchTime, setSearchTime] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchRequested, setSearchRequested] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  useEffect(() => {
    if (searchRequested && isAuthenticated && query.trim() !== "") {
      fetchImages();
      setSearchRequested(false);
    }
  }, [query, isAuthenticated, searchRequested]);

  useEffect(() => {
    if (showFavorites && isAuthenticated) {
      fetchFavorites();
    }
  }, [showFavorites, isAuthenticated]);

  const fetchImages = async () => {
    try {
      const response = await axios.get<GoogleSearchResponse>(
        `https://www.googleapis.com/customsearch/v1?key=${
          import.meta.env.VITE_GOOGLE_API_KEY
        }&cx=${
          import.meta.env.VITE_GOOGLE_ID
        }&num=10&searchType=image&q=${query}&excludeTerms=facebook.com`
      );
      if (response.status !== 200) {
        throw new Error("Error fetching images");
      }
      const data = response.data;
      if (data.items) {
        const imagesData = data.items.map((item) => ({
          title: item.title,
          byteSize: item.image.byteSize,
          url: item.link,
        }));
        setImages(imagesData);
      }
      if (data.spelling && data.spelling.correctedQuery) {
        setSuggestions([data.spelling.correctedQuery]);
      } else {
        setSuggestions([]);
      }
      if (
        data.searchInformation &&
        data.searchInformation.formattedSearchTime
      ) {
        setSearchTime(data.searchInformation.formattedSearchTime);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get<FavoriteImage[]>(
        `http://localhost:3000/favorites/${user?.sub}`
      );
      if (response.status !== 200) {
        throw new Error("Error fetching favorites");
      }
      const favoriteImages = response.data;
      setFavorites(favoriteImages.map((image) => image.url));
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    }
  };

  const handleSearch = () => {
    if (isAuthenticated && query.trim() !== "") {
      setSearchTime(null);
      setSearchRequested(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const actualSuggestion = suggestion.split(" -")[0];
    setQuery(actualSuggestion);
    setSearchTime(null);
    setSearchRequested(true);
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const saveFavoriteImage = async (imageData: ImageData) => {
    if (!isAuthenticated) {
      console.error("User must be authenticated to save favorites");
      return;
    }
    try {
      const imageDataToSend = { ...imageData, user: user?.sub };
      const response = await axios.post(
        "http://localhost:3000/favorite",
        imageDataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 201) {
        throw new Error("Failed to save favorite image");
      }
      console.log("Favorite image saved successfully");
      fetchFavorites();
    } catch (error) {
      console.error("Error saving favorite image:", error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <img src="./loading.gif" alt="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <div>
      <img
        referrerPolicy="no-referrer"
        src={user!.picture}
        alt={user!.name}
        className="profile-image"
      />
      <h2>{user!.name}</h2>
      <p>{user!.email}</p>
      <p>
        <LogoutButton />
      </p>
      <button onClick={toggleFavorites}>
        {showFavorites ? "Göm Favoriter" : "Visa Favoriter"}
      </button>
      
      {!showFavorites && (
        <div className="button-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök bilder"
          />
          <button onClick={handleSearch}>Sök</button>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && !showFavorites && (
        <div>
          <p className="inline-container">Menade du... </p>
          <ul className="inline-container">
            {suggestions.map((suggestion, index) => {
              const actualSuggestion = suggestion.split(" -")[0];
              return (
                <li
                  key={index}
                  className="suggestion"
                  onClick={() => handleSuggestionClick(actualSuggestion)}
                >
                  {actualSuggestion}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Search Time */}
      {searchTime && !showFavorites && <p>Söktid: {searchTime}</p>}

      {/* Image Container */}
      <div className="image-container">
        {!showFavorites &&
          images.map((image, index) => (
            <div key={index}>
              <img src={image.url} alt={`Image ${index}`} />
              <div>
                <button
                  onClick={() =>
                    saveFavoriteImage({
                      title: image.title,
                      byteSize: image.byteSize,
                      url: image.url,
                    })
                  }
                >
                  Spara som favorit
                </button>
              </div>
            </div>
          ))}
        {showFavorites && favorites.length === 0 && (
          <p>Du har inga favoriter.</p>
        )}
        {showFavorites &&
          favorites.length > 0 &&
          favorites.map((image, index) => (
            <div key={index}>
              <img src={image} alt={`Favorite ${index}`} />
            </div>
          ))}
      </div>
    </div>
  ) : (
    <LoginButton />
  );
};

export default App;
