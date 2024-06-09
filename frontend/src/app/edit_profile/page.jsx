"use client";
import { useEffect, useState } from "react";
import { getData, postData } from "@/services/apiCalls.js";
import axios from "axios";

const EditProfile = () => {
	const [data, setData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		avatar: "",
	});
	const [userData, setUserData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		avatar: "",
	});

	useEffect(() => {
		getData("profile/data").then((res) => {
			if (res?.status === 200) {
				setData(res.data.user);
				console.log("USER DATA: ", res.data.user);
			}
		});
	}, []);

	const handleChange = (e) => {
		setUserData({ ...userData, [e.target.name]: e.target.value });
	};

	const handle_avatar = (e) => {
		setUserData({ ...userData, avatar: e.target.files[0] });
	};

	const UpdateProfile = async (e) => {
		e.preventDefault();

		try {
			postData(
				"profile/update",
				{
					username: userData.username
						? userData.username
						: data.username,
					email: userData.email ? userData.email : data.email,
					first_name: userData.first_name
						? userData.first_name
						: data.first_name,
					last_name: userData.last_name
						? userData.last_name
						: data.last_name,
					avatar: userData.avatar ? userData.avatar : "",
					password: userData.password,
				},
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div>
			<h1>Edit Profile</h1>
			<div className="edit-profile">
				<form
					onSubmit={UpdateProfile}
					method="POST"
					enctype="multipart/form-data"
				>
					<div className="avatar_field">
						<label>Change Avatar</label>
						<input
							type="file"
							name="avatar"
							onChange={handle_avatar}
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
