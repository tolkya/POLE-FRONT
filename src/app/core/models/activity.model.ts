export interface ActivityMedia {
  id: number;
  mediaUrl: string | null;
  mimetype: string | null;
  originalName: string | null;
}

export interface ActivityType {
  id: number;
  name: string;
  status: 'ACTIVE' | 'BLOCKED';
  description: string | null;
  medias: ActivityMedia[];
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  activityType: ActivityType;
  createdAt: string;
  levels: { id: number; value: string }[];
  medias: ActivityMedia[];
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
