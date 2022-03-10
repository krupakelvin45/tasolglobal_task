import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import "./CharacterSel.css";
import CircularProgress from "@mui/material/CircularProgress";

let characters = [];
let charactersFullData = [];
let baseUrl = "https://swapi.dev/api/";
let filmNames = [];
let filmYear = [];
let releaseDate;
let latestDate;
let latestFilmName;

getCharactersfromAPI(baseUrl + "people/?format=json");

export default function CharacterSel() {
  const [characterIndex, setCharacterIndex] = useState(-1);
  const [films, setFilms] = useState([]);
  const [lastYear, setYear] = useState("");
  const [lastMovieName, setlastMovieName] = useState("");
  const [filmsLoaded, setfilmsLoaded] = useState(true);

  useEffect(() => {
    if (characterIndex >= 0) {
      console.log(charactersFullData[characterIndex].films);

      filmNames = [];
      latestDate = null;
      setfilmsLoaded(false);
      setFilms([]);

      Promise.all(
        charactersFullData[characterIndex].films.map(async (film) => {
          console.log(`Api is being called for ${film}`);
          await axios.get(`${film}/?format=json`).then((filmData) => {
            console.log(filmData);
            filmNames.push(filmData.data.title);
            releaseDate = filmData.data.release_date;

            if (releaseDate > latestDate || latestDate == null) {
              latestDate = releaseDate;
              latestFilmName = filmData.data.title;
            }
            //  filmYear.push(filmData.data.release_date)
            //  console.log(filmYear);

            // releseDate = new Date(Math.max.apply(...filmData.data.release_date));

            console.log(releaseDate);
          });
        })
      ).then((value) => {
        setfilmsLoaded(true);
        setFilms(filmNames);
        console.log(latestDate);

        let latestYear = new Intl.DateTimeFormat("en", {
          year: "numeric",
        }).format(new Date(latestDate));

        setYear(latestYear.toString());
        setlastMovieName(latestFilmName);
      });

      // setYear(releseDate);
    } else {
      setFilms([]);
      setYear("");
      setlastMovieName("");
      setfilmsLoaded(true);
    }
  }, [characterIndex]);

  return (
    <div>
      <div className="characterDropdown">
        <Autocomplete
          disablePortal
          id="characters_selection"
          options={characters}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Choose Character" />
          )}
          onChange={(event, value) => {
            setCharacterIndex(value.characterIndex);
          }}
        />
      </div>
      <div className="filmNames">
        <h2>List of Movies</h2>
        <Box
          className="filmNameBox"
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {!filmsLoaded ? <CircularProgress></CircularProgress> : <div></div>}
          <List>
            {films.map((film, index) => (
              <ListItem key={index}>
                <ListItemText primary={film}></ListItemText>
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
      <p>
        <strong>Name/Year of Last Movie</strong>
      </p>
      <p>
        {lastMovieName} - {lastYear}
      </p>
    </div>
  );
}

function getCharactersfromAPI(url) {
  axios.get(url).then((charactersData) => {
    console.log(charactersData);
    charactersData.data.results.map((character, index) => {
      charactersFullData.push(character);
      characters.push({ label: character.name, characterIndex: index });
    });

    if (
      charactersData.data.next &&
      charactersData.data.next !== "" &&
      charactersData.data.next.length > 0
    ) {
      getCharactersfromAPI(charactersData.data.next);
    } else {
      return;
    }
  });
}
