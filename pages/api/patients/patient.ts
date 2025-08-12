import { getOrCreateVisit, upsertPatientFromIntake } from '../../lib/store';

// ... dentro de tu handler, después de guardar el intake de la visita:
upsertPatientFromIntake(String(visitId), intake);
