import "./style.css"

const PlayMode = () => {
	
	return (
		<div className="main-page">
            <div className="transparent">
                <div className="title">
                    Play Pong with others
                </div>
                <div className="modes-container">
                    <div className="left-mode">
                        <img src="mode1.svg" alt="remote-game" />
                        <p>REMOTE GAME</p>
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
            </div>
        </div>
	)
}

export default PlayMode;