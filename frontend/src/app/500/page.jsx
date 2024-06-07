"use client";
import Image from 'next/image';
const InternalServerError = () => {
	return (
		<div>
			<Image src="/500.svg" 
				width={1000}
				height={1000}
				alt="" 
				style={{
					marginLeft: '150px',
					marginTop: '-90px'
					}}/>
		</div>
	);
};

export default InternalServerError;
