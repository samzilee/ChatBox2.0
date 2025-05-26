import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from "./components/main/Main";
import LoginPage from "./components/Login/loginPage";
import SigninPage from "./components/SignUp/signinPage";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main path={"home"} />,
    },
    {
      path: "/channels/chatroom",
      element: <Main path={"chatroom"} />,
    },

    {
      path: "/logIn",
      element: <LoginPage />,
    },
    {
      path: "/signUp",
      element: <SigninPage />,
    },
  ]);

  return (
    <main className="text-gray-700 font-semibold">
      <RouterProvider router={router} />
    </main>
  );
};

export default App;
