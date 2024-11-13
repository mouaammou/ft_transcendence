'use client';
import Image from 'next/image';
const InternalServerError = () => {
  return (
    <div>
      {/* <Image src="/500.svg" 
				width={800}
				height={800}
				priority
				alt="" 
				style={{
					display: 'flex',
					margin: 'auto',
					maxWidth: '100%',
					// width: 'auto',
					height: 'auto'
					}}/> */}
      THE SERVER IS SHUT DOWN :(
    </div>
  );
};

export default InternalServerError;
