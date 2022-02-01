export interface SteamPlayer {
  steamid: string
  communityvisibilitystate: number
  profilestate: number
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  avatarhash: string
  personastate: number
  realname: string
  primaryclanid: string
  timecreated: number // Unix timestamp
  personastateflags: number
}
