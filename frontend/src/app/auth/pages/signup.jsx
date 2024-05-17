"use client";

import { useState } from "react";
import axios from "axios";

function Signup() {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [invalidInput, setInvalidInput] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");

   const postData = {
      username: username,
      email: email,
      password: password,
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         setInvalidInput(true);
         return;
      }
      setInvalidInput(false);
      setErrorMessage("");

      //make a post request to the server
      axios
         .post("http://localhost:8000/signup/", postData)
         .then((res) => {
            console.log("data==> ", res.data);
         })
         .catch((error) => {
            console.log("error ==> ", error);
            console.log("username: ", error.response.data.username);
            error.response.data.username;
            error.response.data.email;
            error.response.data.password;

            setErrorMessage(
               <>
                  <p>{error.response.data.username}</p>
                  <p>{error.response.data.email}</p>
                  <p>{error.response.data.password}</p>
               </>
            );
         });
   };

   return (
      <div className="signup">
         <h1>sign up</h1>
         <form onSubmit={handleSubmit} method="POST">
            <input
               type="text"
               placeholder="username"
               name="username"
               required
               onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage("");
               }}
            />
            <input
               type="email"
               placeholder="email"
               name="email"
               required
               onChange={(e) => setEmail(e.target.value)}
            />
            <input
               type="password"
               placeholder="password"
               name="password"
               required
               onChange={(e) => setPassword(e.target.value)}
            />
            <input
               type="password"
               placeholder="confirm password"
               name="confirmPassword"
               required
               onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">submit</button>
            <br />
            {invalidInput && <p>Passwords do not match</p>}
            {errorMessage}
         </form>
      </div>
   );
}

export default Signup;
