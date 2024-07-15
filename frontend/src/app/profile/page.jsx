import HorizontalLine from "./HorizontalLine.jsx"
import CustomButton from "./CustomButton.jsx";
import Cart from "./Cart.jsx";
import "@styles/profile/profile.css";

const Profile = () => {
	return (
		<div className="profile">
			<div className="profile-section">
				<div className="profile-pic-name">
					<div className="div-profile-pic">
						<img className="profile-pic" src="/avatar2.jpeg" alt="profile_pic" />
					</div>
					<div className="profile-name-btn">
						<div className="profile-name">Mohamed OUAAMMOU</div>
						<button className="edit-btn">Edit Profile
							<img className="edit-pen" src="EditPen.svg" alt="" />
						</button>
					</div>
				</div>
				<div className="profile-level">
					<p>level</p>
					<img src="levelBar.svg" alt="" />
				</div>
				<HorizontalLine  lWidth='70px' />
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
				<HorizontalLine  lWidth='70px'  />
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
			<div className="horizontal-line">
			<hr style={{
					border: '0.5px solid gray',
					height: '430px',
					width: '0px',
					position: 'absolute',
					zIndex: '2',
					top: '380px'
				}} />
			</div>
			<div className="friends-section">
				<div className="title">
					<p>Friends</p>
					<HorizontalLine lWidth='258px' lTop='10px'/>
				</div>
				<div className="cards">
					<div className="recent-activity">
						<div className="title-div">
							<div>Recent activity</div>
							<div className="see-all">See all</div>
						</div>
						<Cart cartColor='#797979' imgg='/samjaabo.jpeg' name='Said amjaabou'/>
						<Cart cartColor='#797979' imgg='/mouad.jpeg' name='Mouad Tsetta'/>
						<Cart cartColor='#797979' imgg='/user2.svg' name='Mouad lem9awd'/>
						<Cart cartColor='#797979' imgg='/med.jpeg' name='ching chong' />
					</div>
					<div className="new-members">
						<div  className="title-div">
							<div>New members</div>
							<div className="see-all">See all</div>
						</div>
						<Cart cartColor='rgba(255, 255, 255, 0.05)' imgg='/avatar.webp'   name='Lina Gartitoz'  />
						<Cart cartColor='rgba(255, 255, 255, 0.05)' imgg='/avatar3.jpeg'  name='Bsisi 3akh3oukh '  />
						<Cart cartColor='rgba(255, 255, 255, 0.05)' imgg='/avatar4.jpeg'  name='Hmida lamba'  />
						<Cart cartColor='rgba(255, 255, 255, 0.05)' imgg='/oredoine.webp' name='Oussama Lapay'   />
						
					</div>
				
				</div>
				<div className="statistics">
					<div className="title">
						<p>Statistics</p>
						<HorizontalLine lWidth='258px' lTop='10px' />
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