import HorizontalLine from "./HorizontalLine.jsx"
import CustomButton from "./CustomButton.jsx";
import "./style.css"

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
				<HorizontalLine lWidth='540px' />
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
				<HorizontalLine lWidth='540px'  />
				<div className="badges-collected">
					<p>Badges collected</p>
					<div className="badges">
						<img src="badge1.svg" alt="badge1" />
						<img className="ramen" src="badge3.svg" alt="badge3" />
						<img src="badge2.svg" alt="badge2" />
						<img src="badge4.svg" alt="badge4" />
					</div>
				</div>
			</div>
			<div>
			<hr style={{
					border: '0.5px solid gray',
					height: '430px',
					width: '0px',
					position: 'absolute',
					top: '380px'
				}} />
			</div>
			<div className="friends-section">
				<div className="title">
					<p>Friends</p>
					<HorizontalLine lWidth='258px'  />
				</div>
				<div></div>
				<div className="statistics">
					<div className="title">
						<p>Statistics</p>
						<HorizontalLine lWidth='258px'  />
					</div>
					<div className="buttons">
						<div>
							<CustomButton myLabel={'Matches'} count={46} color='#E9C46A'/>
						</div>
						<div>
							<CustomButton myLabel={'Wins'} count={40} color='#2A9D8F'/>
						</div>
						<div>
							<CustomButton myLabel={'Loses'} count={6} color='#E63946'/>
						</div>
					</div>
				</div>
			</div>
		</div>
	 );
}

export default Profile;