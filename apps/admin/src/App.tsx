import { IonApp } from "@ionic/react";

import { AdminPlaceholderView } from "./Features/Shell/AdminPlaceholderView";

/**
 * Administration application root.
 */
function App(): JSX.Element {
  return (
    <IonApp>
      <AdminPlaceholderView />
    </IonApp>
  );
}

export default App;
