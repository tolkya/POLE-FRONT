import { UserRef } from './api.model';
import { Activity } from './activity.model';

export type UserActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';
export type UserActivityRole = 'TEACHER' | 'STUDENT';

export interface UserActivity {
  id: number;
  member: UserRef;
  activity: Activity;
  role: UserActivityRole;
  status: UserActivityStatus;
  createdAt: string;
}

export interface EnrollMemberDto {
  memberId: number;
  role: UserActivityRole;
}

/** Retourné par GET /api/me/activities */
export interface MyActivity {
  id: number;
  activity: Activity;
  role: UserActivityRole;
  status: UserActivityStatus;
  createdAt: string;
}
