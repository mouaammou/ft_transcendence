import Image from 'next/image';

const NotFound = () => {
  return (
    <div>
      <img
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
