"use client";
import HorizontalLine from "./HorizontalLine.jsx";
import CustomButton from "./CustomButton.jsx";
import "../../Styles/profile/profile.css";
import Cart from "./Cart.jsx";
import { useEffect} from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/loginContext.jsx";

const Profile = () => {
	
	const {profileData: data, fetch_profile} = useAuth() 
	useEffect(() =>{
		fetch_profile()
	}, [])

	return (
		<>
			<div className="profile">
				<div className="profile-section">
					<div className="profile-pic-name">
						<div className="">
							<img
								className="profile-pic"
								src={data?.avatar}
								alt="profile_pic"
							/>
						</div>
						<div className="profile-name-btn">
							<div className="profile-name">{data?.username}</div>
							<button className="edit-btn">
								<Link href="/edit_profile">
									Edit Profile
									<img
										className="edit-pen"
										src="EditPen.svg"
										alt=""
									/>
								</Link>
							</button>
						</div>
					</div>
					<div className="profile-level">
						<p>level</p>
						<img src="levelBar.svg" alt="" />
					</div>
					<HorizontalLine lWidth="540px" />
					<div className="info">
						<p>Infos</p>
						<div className="info-section">
							{/* <div>
								<img src="/call.svg" alt="" />
							</div> */}
							<div className="sps-info">
								Username : {data?.username}
							</div>
						</div>
						<div className="info-section">
							{/* <div>
								<img src="/email.svg" alt="" />
							</div> */}
							<div className="sps-info">email: {data?.email}</div>
						</div>
						<div className="info-section">
							{/* <div>
								<img src="/linkedin.svg" alt="" />
							</div> */}
							<div className="sps-info">
								first_name: {data?.first_name}
								<br />
								<br />
								last_name: {data?.last_name}
							</div>
						</div>
					</div>
					<HorizontalLine lWidth="540px" />
					<div className="badges-collected">
						<p>Badges collected</p>
						<div className="badges">
							<img src="badge1.svg" alt="badge1" />
							<img
								className="ramen"
								src="badge3.svg"
								alt="badge3"
							/>
							<img src="badge2.svg" alt="badge2" />
							<img src="badge4.svg" alt="badge4" />
						</div>
					</div>
				</div>
				<div>
					<hr
						style={{
							border: "0.5px solid gray",
							height: "430px",
							width: "0px",
							position: "absolute",
							top: "380px",
						}}
					/>
				</div>
				<div className="friends-section">
					<div className="title">
						<p>Friends</p>
						<HorizontalLine lWidth="258px" />
					</div>
					<div className="cards">
						<div className="recent-activity">
							<div className="title-div">
								<div>Recent activity</div>
								<div className="see-all">See all</div>
							</div>
							<Cart
								cartColor="#797979"
								imgg="/samjaabo.jpeg"
								name="Said amjaabou"
							/>
							<Cart
								cartColor="#797979"
								imgg="/mouad.jpeg"
								name="Mouad Tsetta"
							/>
							<Cart
								cartColor="#797979"
								imgg="/user2.svg"
								name="Mouad lem9awd"
							/>
							<Cart
								cartColor="#797979"
								imgg="/med.jpeg"
								name="ching chong"
							/>
						</div>
						<div className="new-members">
							<div className="title-div">
								<div>New members</div>
								<div className="see-all">See all</div>
							</div>
							<Cart
								cartColor="rgba(255, 255, 255, 0.05)"
								imgg="/avatar.webp"
								name="Lina Gartitoz"
							/>
							<Cart
								cartColor="rgba(255, 255, 255, 0.05)"
								imgg="/avatar3.jpeg"
								name="Bsisi 3akh3oukh "
							/>
							<Cart
								cartColor="rgba(255, 255, 255, 0.05)"
								imgg="/avatar4.jpeg"
								name="Hmida lamba"
							/>
							<Cart
								cartColor="rgba(255, 255, 255, 0.05)"
								imgg="/oredoine.webp"
								name="Oussama Lapay"
							/>
						</div>
					</div>
					<div className="statistics">
						<div className="title">
							<p>Statistics</p>
							<HorizontalLine lWidth="258px" />
						</div>
						<div className="buttons">
							<div>
								<CustomButton
									myLabel={"Matches"}
									count={46}
									color="#E9C46A"
								/>
							</div>
							<div>
								<CustomButton
									myLabel={"Wins"}
									count={40}
									color="#2A9D8F"
								/>
							</div>
							<div>
								<CustomButton
									myLabel={"Loses"}
									count={6}
									color="#E63946"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Profile;
