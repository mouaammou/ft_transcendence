const Profile = () => {
	return (
		<div className="profile">
			<div className="profile-section">
				<div className="profile-pic-name">
					<div className="">
						<img className="profile-pic" src="/avatar2.jpeg" alt="profile_pic" />
					</div>
					<div className="profile-name-btn">
						<div className="profile-name">Mohamed</div>
						<button className="edit-btn">Edit Profile
							<img className="edit-pen" src="EditPen.svg" alt="" />
						</button>
					</div>
				</div>
				<div className="profile-level">
					<p>level</p>
					<img src="levelBar.svg" alt="" />
				</div>
				<div className="br">
					<hr style={{border: '0.5px solid gray'}}/>
				</div>
				<div className="info">
					<p>Infos</p>
					<div className="info-section">
						<div>
							<img src="/call.svg" alt="" />
						</div>
						<div className="sps-info">+212658585858</div>
					</div>
					<div className="info-section">
						<div>
							<img src="/email.svg" alt="" />
						</div>
						<div className="sps-info">mouad_example@gmail.com</div>
					</div>
					<div className="info-section">
						<div>
							<img src="/linkedin.svg" alt="" />
						</div>
						<div className="sps-info">linkeden.com/example000</div>
					</div>
				</div>
				<div className="br">
					<hr style={{border: '0.5px solid gray'}}/>
				</div>
			</div>
			<div className="friends-section">
				Friends
			</div>
		</div>
	 );
}

export default Profile;