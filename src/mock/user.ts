export interface UserInfo {
  id: number
  avatar: string
  nickname: string
  phone: string
  email: string
}

export interface SettingsItem {
  id: number
  icon: string
  title: string
  path?: string
  switch?: boolean
  switchValue?: boolean
  value?: string
}

export interface AboutItem {
  id: number
  icon: string
  title: string
  path?: string
}

export const userInfo: UserInfo = {
  id: 1,
  avatar: 'https://picsum.photos/200/200?random=10',
  nickname: '科技极客',
  phone: '138****8888',
  email: 'tech@example.com'
}

export const settingsList: SettingsItem[] = [
  { id: 1, icon: '👤', title: '个人信息', path: '/pages/settings/profile', switch: false },
  { id: 2, icon: '🔔', title: '消息通知', path: '', switch: true, switchValue: true },
  { id: 3, icon: '🔒', title: '隐私设置', path: '/pages/settings/privacy', switch: false },
  { id: 4, icon: '🌙', title: '深色模式', path: '', switch: true, switchValue: false },
  { id: 5, icon: '🗣', title: '语言', value: '简体中文', path: '/pages/settings/language', switch: false },
]

export const aboutList: AboutItem[] = [
  { id: 1, icon: '📖', title: '使用帮助', path: '' },
  { id: 2, icon: '📋', title: '用户协议', path: '' },
  { id: 3, icon: '🔐', title: '隐私政策', path: '' },
  { id: 4, icon: 'ℹ️', title: '关于我们', path: '' },
]

export const updateUserInfo = (info: Partial<UserInfo>): void => {
  Object.assign(userInfo, info)
}
