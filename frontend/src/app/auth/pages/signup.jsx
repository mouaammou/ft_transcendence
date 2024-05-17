"use client";

import { useState } from "react";

function Signup() {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [invalidPass, setInvalidPass] = useState(false);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         setInvalidPass(true);
         return;
      }
      setInvalidPass(false);

	  // Send the data to the server: localhost:8000/sigup
	  //solve cors error by adding "Access-Control-Allow-Origin": "*" in the backend
	   fetch("http://127.0.0.1:8000/signup/", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            // Send the data in JSON format
            username,
            email,
            password,
         }),
      })
         .then((res) => res.json())//CONVER JSON TO JS OBJECT
         .then((data) => {
            console.log("DATA: ", data);
         })
         .catch((err) => {
            console.log("ERRORS: ", err);
         });
   };

   return (
      <div className="signup">
         <h1>sign up</h1>
         <form>
            <input
               type="text"
               placeholder="username"
               name="username"
               required
               onChange={(e) => setUsername(e.target.value)}
            />
            <input
               type="text"
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
            <button onClick={handleSubmit}>submit</button>
            <br />
            {invalidPass && <p>Passwords do not match</p>}
         </form>
      </div>
   );
}

export default Signup;
