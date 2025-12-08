export interface SocketCallback<T = unknown> {
  success: boolean
  message?: string
  data?: T
}
