import Link from "next/link";
import "@/Styles/auth/change_password.css";

const SignUp = () => {
	
	return (
		<div className="main-container-change-pass">
            <div className="main-login-change-pass">
                <p>Change your password</p>
                <input type="text" placeholder="New password"/>
                <input type="text" placeholder="Confirm password"/>
                <button>Change password</button>
            </div>
            <div className="side-image">
                <img className="sign-with" src="/Reset-password.svg" alt="welcome"/>
            </div>
        </div>
	)
}

export default SignUp;