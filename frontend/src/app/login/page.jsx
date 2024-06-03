import "./style.css"

const LogIn = () => {
	
	return (
		<div className="main-container">
            <div className="main-login">
                <p>Sing Up</p>
                <div className="first-last-names">
                    <input type="text" placeholder="First name"/>
                    <input type="text" placeholder="Last name"/>
                </div>
                <input type="text" placeholder="Username"/>
                <input type="text" placeholder="Enter Your Email"/>
                <input type="text" placeholder="Enter Your Password"/>
                <input type="text" placeholder="Confirm Password"/>
                <button>Register</button>
            </div>
            <div className="side-image">
                <img src="login-pane.svg" alt="welcome" />
            </div>
        </div>
	)
}

export default LogIn;