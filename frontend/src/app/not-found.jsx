import Image from 'next/image';

const NotFound = () => {
  return (
    <div>
      {/* 404 not found
	return (
		<div >
			{/* 404 not found
				<p> sorry this page is not available for now</p> */}
      <Image
        src="/404.svg"
        width={800}
        height={800}
        alt=""
        style={{
          display: 'flex',
          margin: 'auto',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};

export default NotFound;
