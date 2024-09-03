import Link from "next/link";
import "@/styles/auth/forget_password.css";

const SignUp = () => {
	
	return (
		<div className="main-container-forget">
            <div className="forget-main-login">
                <p>Forgot your password?</p>
                <div className="description">
                    Enter the email address associated with your account,
                     and we'll send you a link to reset your password.
                </div>
                <input type="text" placeholder="Example@gmail.com"/>
                <button>Send reset link</button>
                <button className="second-button">Go back</button>
            </div>
            <div className="side-image">
                <img className="sign-with" src="/forget-pass.svg" alt="welcome"/>
            </div>
        </div>
	)
}

export default SignUp;