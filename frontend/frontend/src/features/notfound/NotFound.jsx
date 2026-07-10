import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <h1 className="text-8xl font-bold text-violet-600">404</h1>

      <h2 className="text-3xl font-semibold mt-4">
        Page Not Found
      </h2>

      <p className="text-gray-500 mt-3 text-center">
        Sorry, the page you are looking for doesn't exist.
      </p>

      <Link
        to="/dashboard"
        className="mt-8 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;