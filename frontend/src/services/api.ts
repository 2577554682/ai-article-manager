import axios from "axios";
import type {
  UserCreate,
  UserResponse,
  UserLogin,
  Token,
  PostCreate,
  PostUpdate,
  PostResponse,
  ChatRequest,
  ChatResponse,
  ChatHistoryItem,
  PostCount,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// 请求拦截器：自动添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 时清除 token 并跳转登录页
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ===== 用户认证 =====
export const register = (data: UserCreate) =>
  api.post<UserResponse>("/users", data);

export const login = (data: UserLogin) =>
  api.post<Token>("/auth/login", data);

// ===== 文章管理 =====
export const createPost = (data: PostCreate) =>
  api.post<PostResponse>("/posts", data);

export const getMyPosts = () =>
  api.get<PostResponse[]>("/posts");

export const getPublicPosts = (skip = 0, limit = 50) =>
  api.get<PostResponse[]>("/posts/public", { params: { skip, limit } });

export const getPostCount = () =>
  api.get<PostCount>("/posts/count");

export const searchPosts = (title: string, skip = 0, limit = 50) =>
  api.get<PostResponse[]>("/posts/search", { params: { title, skip, limit } });

export const getPost = (postId: number) =>
  api.get<PostResponse>(`/posts/${postId}`);

export const updatePost = (postId: number, data: PostUpdate) =>
  api.put<PostResponse>(`/posts/${postId}`, data);

export const deletePost = (postId: number) =>
  api.delete<{ message: string }>(`/posts/${postId}`);

// ===== AI 聊天 =====
export const sendChatMessage = (data: ChatRequest) =>
  api.post<ChatResponse>("/chat", data);

export const getChatHistory = () =>
  api.get<ChatHistoryItem[]>("/chat/history");
