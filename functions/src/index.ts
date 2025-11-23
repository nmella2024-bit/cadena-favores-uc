import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin
admin.initializeApp();

// Configuración global
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit.
setGlobalOptions({maxInstances: 10});

// Exportar triggers
export * from "./triggers/scheduled";
export * from "./triggers/firestore";
