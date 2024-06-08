const EditProfile = () => {
	return (
		<div>
			<h1>Edit Profile</h1>
			<div className="edit-profile">
				<div className="avatar_field">

					<label>Change Avatar</label>
					<input type="file" />
				</div>
				<div className="input_field">
					<label>Username</label>
					<input type="text" placeholder="Username" />
				</div>
				<div className="input_field">
					<label>Email</label>
					<input type="email" placeholder="Email" />
				</div>
				<div className="input_field">
					<label>First Name</label>
					<input type="text" placeholder="First Name" />
				</div>
				<div className="input_field">
					<label>Last Name</label>
					<input type="text" placeholder="Last Name" />
				</div>
				<br />
				<h2>Change Password</h2>
				<div className="input_field">
					<label>Password</label>
					<input type="password" placeholder="Password" />
				</div>
				<div className="input_field">
					<label>Confirm Password</label>
					<input type="password" placeholder="Confirm Password" />
				</div>
			</div>
		</div>
	);
};

export default EditProfile;
