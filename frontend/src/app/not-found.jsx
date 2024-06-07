import Image from "next/image";

const NotFound = () => {
	return (
		<div>
			{/* 404 not found
			<p> sorry this page is not available for now</p> */}
			<Image src="/404.svg" 
				width={1000}
				height={1000}
				alt="" 
				style={{
					marginLeft: '250px',
					marginTop: '-90px'
					}}/>
		</div>
	 );
}

export default NotFound;