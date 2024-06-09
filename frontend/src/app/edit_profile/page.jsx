"use client";
import { useEffect, useState } from "react";
import { getData, postData } from "@/services/apiCalls.js";

const EditProfile = () => {
	const [data, setData] = useState({});
	const [userData, setUserData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		avatar: "",
	});

	useEffect(() => {
		getData("profile/data").then((res) => {
			setData(res.data.user);
		});
	}, []);

	const handleChange = (e) => {
		setUserData({ ...userData, [e.target.name]: e.target.value });
	};

	const UpdateProfile = async (e) => {
		e.preventDefault();
		try {
			res = await postData("profile/update", userData);
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<div>
			<h1>Edit Profile</h1>
			<div className="edit-profile">
				<form onSubmit={UpdateProfile} method="POST">
					<div className="avatar_field">
						<label>Change Avatar</label>
						<input
							type="file"
							name="avatar"
							onChange={handleChange}
						/>
						<img
							src={data?.avatar}
							alt="profile_pic"
							width={200}
							height={200}
						/>
					</div>
					<div className="input_field">
						<label>Username</label>
						<input
							type="text"
							placeholder="Username"
							name="username"
							value={data?.username}
							onChange={handleChange}
						/>
					</div>
					<div className="input_field">
						<label>Email</label>
						<input
							onChange={handleChange}
							type="email"
							placeholder="Email"
							name="email"
						/>
					</div>
					<div className="input_field">
						<label>First Name</label>
						<input
							onChange={handleChange}
							type="text"
							placeholder="First Name"
							name="first_name"
						/>
					</div>
					<div className="input_field">
						<label>Last Name</label>
						<input
							onChange={handleChange}
							type="text"
							placeholder="Last Name"
							name="last_name"
						/>
					</div>
					<br />
					<h2>Change Password</h2>
					<div className="input_field">
						<label>Password</label>
						<input
							onChange={handleChange}
							type="password"
							placeholder="Password"
							name="password"
						/>
					</div>
					<div className="input_field">
						<label>Confirm Password</label>
						<input
							onChange={handleChange}
							type="password"
							placeholder="Confirm Password"
							name="confirmPassword"
						/>
					</div>
					<button type="submit">Update</button>
				</form>
			</div>
		</div>
	);
};

export default EditProfile;
