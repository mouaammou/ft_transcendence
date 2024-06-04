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
                <img src="login-with.svg" alt="login-with" className="sign-with"/>
                <div className="logos">
                    <img src="g3.svg" alt=""  className="_42-logo" />
                    <img src="google-icon.png" alt="" className="google-logo" />
                </div>
            </div>
            <div className="side-image">
                <img className="sign-with" src="login-pane.svg" alt="welcome"/>
            </div>
        </div>
	)
}

export default LogIn;