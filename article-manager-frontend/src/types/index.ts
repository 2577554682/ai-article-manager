// 用户
export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  create_time: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// 文章
export interface PostCreate {
  title: string;
  content: string;
  is_public?: boolean;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  is_public?: boolean;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  is_public: boolean;
  create_time: string | null;
  update_time: string | null;
}

// AI 聊天
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ChatHistoryItem {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

// 文章统计
export interface PostCount {
  total: number;
  public: number;
}
