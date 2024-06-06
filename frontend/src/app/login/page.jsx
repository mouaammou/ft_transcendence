import Link from "next/link";
import "./style.css"

const SignUp = () => {
	
	return (
		<div className="main-container">
            <div className="main-login">
                <p>Join</p>
                <input type="text" placeholder="Enter Your Email"/>
                <input type="text" placeholder="Enter Your Password"/>
                <button>Login</button>
                <img src="login-with.svg" alt="login-with" className="sign-with"/>
                <div className="logos">
                    <img src="g3.svg" alt=""  className="_42-logo" />
                    <img src="google-icon.png" alt="" className="google-logo" />
                </div>
                <div className="forgot-password">
                    <a href="">Forgot your password?</a>
                    <div className="have-no-account">
                        Don't have an account? 
                        <Link rel="stylesheet" href="/signup">Sign up</Link>
                    </div>
                </div>
            </div>
            <div className="side-image">
                <img className="sign-with" src="join.svg" alt="welcome"/>
            </div>
        </div>
	)
}

export default SignUp;