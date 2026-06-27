import { IonApp } from "@ionic/react";
import { useMemo } from "react";

import { createAdminCompositionRoot } from "./CompositionRoot";
import { AdminShellView } from "./Features/Shell/AdminShellView";

/**
 * Administration application root.
 */
function App(): JSX.Element {
  const composition = useMemo(() => createAdminCompositionRoot(), []);

  return (
    <IonApp>
      <AdminShellView composition={composition} />
    </IonApp>
  );
}

export default App;
