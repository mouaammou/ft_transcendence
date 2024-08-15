"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/loginContext";
import { postData } from "@/services/apiCalls";

const EditProfile = () => {

	const [errors, setErrors] = useState({})
	const [userData, setUserData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		avatar: "",
		password: ""
	});
	
	const {profileData: data, fetch_profile, setProfileData} = useAuth()
	useEffect(() =>{
		fetch_profile()
	}, [])


	const handleChange = (e) => {
		setUserData({ ...userData, [e.target.name]: e.target.value });
	};

	const handle_avatar = (e) => {
        const file = e.target.files[0];

        // Check if a file is selected
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileData({avatar: reader.result});
            };
            reader.readAsDataURL(file); // Convert the file to a base64 string for preview
			
            // Set the avatar file in userData state
            setUserData({ ...userData, avatar: file });
        }
    };


	const UpdateProfile = async (e) => {
		e.preventDefault();

		const updatedData = {
			username: userData.username,
			email: userData.email,
			first_name: userData.first_name,
			last_name: userData.last_name,
			avatar: userData.avatar,
			password: userData.password,
		  };

		console.log(updatedData.avatar);
		// Check if all fields are empty
        const isEmpty = Object.values(updatedData).every(
            (value) => !value || (typeof value === 'object' && !value.name)
        );

        if (isEmpty) {
            setErrors({Error: 'At least one field must be provided.'});
            return;
        }
		try {
			const res = await postData(
				"profile/update", updatedData, {headers: { "Content-Type": "multipart/form-data",},
			});
			if (res.status == 200 && res.data.success)
				{
					if (res.data.avatar)
						setProfileData({avatar: res.data.avatar})
					setErrors({success: res.data.success})
				}
			else if (res.response?.status == 400)
				{
					// console.log(erro);
					setErrors(res.response.data.errors)
				}
		} catch (err) {
			// console.log("catch block : ",err.response.data?.errors);
			// setErrors(err.response.data.errors)
		}
	};

	return (
		<div>
			<h1>Edit Profile</h1>
			<div className="edit-profile">
				<form
					onSubmit={UpdateProfile}
					method="POST"
					encType="multipart/form-data"
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
						<label>username</label>
						<input
							type="text"
							placeholder="username"
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
					<br />
					<br />
					<div>
						{errors.success}
						<br />
						{errors.username}
						<br />
						{errors.email}
						<br />
						{errors.Error}
						<br />
						{errors.avatar}
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditProfile;
