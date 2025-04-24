import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from "./components/main/Main";
import LoginPage from "./components/Login/Page";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "login",
      element: <LoginPage />,
    },
  ]);

  return (
    <main className="text-gray-700 font-semibold">
      <RouterProvider router={router} />
    </main>
  );
};

export default App;
