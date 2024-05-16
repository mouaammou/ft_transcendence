"use client";

import { useState } from "react";

function Signup() {
   return (
      <div className="signup">
         <h1>sign up</h1>
         <form>
            <input type="text" placeholder="username" required />
            <input type="email" placeholder="email" required />
            <input type="password" placeholder="password" required />
            <input type="password" placeholder="confirm password" required />
            <button type="submit" className="submit_signup">sign up</button>
         </form>
      </div>
   );
}

export default Signup;
