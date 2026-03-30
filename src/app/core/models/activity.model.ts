export interface ActivityType {
  id: number;
  name: string;
  status: 'ACTIVE' | 'BLOCKED';
  description: string | null;
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  activityType: ActivityType;
  createdAt: string;
}

export interface ActivityCreateDto {
  name: string;
  description?: string;
  /** IRI de l'ActivityType, ex: /api/activity-types/1 */
  activityType: string;
}

export interface ActivityUpdateDto {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}
