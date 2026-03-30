/** Enveloppe JSON-LD retournée par API Platform pour les collections */
export interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

/** Mini-représentation d'un utilisateur dans les réponses imbriquées */
export interface UserRef {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}
