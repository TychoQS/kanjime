import { IonApp } from "@ionic/react";

import { AppContextProvider } from "./Shared/State/AppContext";
import { AppRouter } from "./Shared/Navigation/AppRouter";

function App(): JSX.Element {
  return (
    <IonApp>
      <AppContextProvider>
        <AppRouter />
      </AppContextProvider>
    </IonApp>
  );
}

export default App;
