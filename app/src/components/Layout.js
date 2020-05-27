import React, { Suspense } from "react";

import AppLoader from "./AppLoader";

const App = React.lazy(() => import("./App"));

export default function Layout() {
  return (
    <div>
      <Suspense fallback={<AppLoader />}>
        <App />
      </Suspense>
    </div>
  );
}
