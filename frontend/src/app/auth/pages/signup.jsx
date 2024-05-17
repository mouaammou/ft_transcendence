"use client";

import { useState } from "react";
import axios from "axios";

function Signup() {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [invalidPass, setInvalidPass] = useState(false);

   const postData = {
      username: username,
      email: email,
      password: password,
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
         setInvalidPass(true);
         return;
      }
      setInvalidPass(false);

      //make a post request to the server
      axios.post("http://localhost:8000/signup/", postData)
         .then((res) => {
            console.log("data==> ", res.data);
         })
         .catch((error) => {
            console.log("error---> ", error.data);
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
            <button onClick={handleSubmit}>submit</button>
            <br />
            {invalidPass && <p>Passwords do not match</p>}
         </form>
      </div>
   );
}

export default Signup;
