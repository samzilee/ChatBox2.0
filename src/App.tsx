import { createHashRouter, RouterProvider } from "react-router-dom";
import Main from "./components/main/Main";
import LoginPage from "./components/Login/loginPage";
import SigninPage from "./components/SignUp/signinPage";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
    };
  }, []);

  const router = createHashRouter([
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
