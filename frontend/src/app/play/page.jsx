"use client";
import "./style.css"
import { useState } from "react";
import { useRouter } from 'next/router';
import RandomGame from "@/components/randomGame/RandomGame";

const PlayMode = () => {
    const [choose, setChoose] = useState(false);
    const [hide, setHide] = useState(false);
    const [name, setName] = useState("");
    const handlePlayRandomGame = () => {
        setChoose(true);
        setHide(true);
      };
	const handleSaveBtn = () => {
        fetch("http://localhost:8000/play/update_tournament_name"
        , {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name,
            })
          })
        .then(response => response.json())
        .then(data => console.log(data));
    }
    const handleInputChange = (event) => {
        event.preventDefault();
        console.log(event.target.value);
        setName(event.target.value);
      };
	return (
		<div className="main-page">
            {choose && 
            <RandomGame/>
            }
            {
                !hide &&
            <div className="transparent">
                <div className="title">
                    Play Pong with others
                </div>
                <div className="modes-container">
                    <div className="left-mode">
                        <img src="mode1.svg" alt="remote-game" />
                        <p onClick={handlePlayRandomGame} >REMOTE GAME</p>
                    </div>
                    <div className="middle-mode">
                        <img src="mode2.svg" alt="remote-game" />
                        <p>LOCAL GAME</p>
                    </div>
                    <div className="right-mode">
                        <img src="mode3.svg" alt="remote-game" />
                        <p>TOURNAMENT</p>
                    </div>
                </div>
                <button className="big-button">NEXT</button>
                <input type="text" onChange={handleInputChange} value={name}/>
                <button onClick={handleSaveBtn}>save</button>
            </div>
            }
        </div>
	)

}
export default PlayMode;