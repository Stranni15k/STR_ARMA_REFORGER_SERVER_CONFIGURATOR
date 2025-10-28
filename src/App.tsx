import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}
