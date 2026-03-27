export type UserRole = 'admin' | 'teacher' | 'parent';
export type InviteRole = 'teacher' | 'parent';
export type NotificationType = 'new_album' | 'new_comment' | 'new_bulletin';

export interface Department {
  id: string;
  name: string;
  sort_order: number;
}

export interface Class {
  id: string;
  department_id: string;
  name: string;
  department?: Department;
}

export interface User {
  id: string;
  name: string;
  kakao_id: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface UserClass {
  user_id: string;
  class_id: string;
  role: InviteRole;
  class?: Class;
  user?: User;
}

export interface InviteCode {
  id: string;
  code: string;
  class_id: string;
  role: InviteRole;
  created_by: string;
  used_by: string | null;
  expires_at: string;
  created_at: string;
  class?: Class;
}

export interface Album {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_by: string;
  created_at: string;
  class?: Class;
  creator?: User;
  photos?: Photo[];
  photo_count?: number;
  cover_photo?: string;
}

export interface Photo {
  id: string;
  album_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  uploaded_by: string;
  created_at: string;
  uploader?: User;
}

export interface Comment {
  id: string;
  album_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  department_id: string | null;
  pinned: boolean;
  created_by: string;
  created_at: string;
  creator?: User;
  department?: Department;
}

export type BulletinCategory = 'lesson' | 'supply' | 'event' | 'general';

export interface Bulletin {
  id: string;
  class_id: string;
  author_id: string;
  title: string;
  content: string;
  category: BulletinCategory;
  created_at: string;
  updated_at: string;
  class?: Class;
  author?: User;
}

export interface BulletinRead {
  bulletin_id: string;
  user_id: string;
  read_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  album_id: string | null;
  bulletin_id: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  album?: Album;
  bulletin?: Bulletin;
}
