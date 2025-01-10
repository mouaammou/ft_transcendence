import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotFound_404 = ({ gobackPage, setPageNotFound, setPageNumber }) => {
  const router = useRouter();

  const handleGoBack = e => {
    e.preventDefault();
    setPageNotFound(false);
    router.push(gobackPage); // This will push the route without reloading
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Available</h2>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or is currently unavailable.
        </p>
        <Link
          href="#"
          onClick={handleGoBack}
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default NotFound_404;
