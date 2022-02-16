import {ObjectId} from 'mongodb'
import {SteamPlayer} from 'steam'
import {User} from 'users'

export class MeDto {
  _id: ObjectId
  name: {
    personal: string
    real: string
  }
  avatar: {
    small: string
    medium: string
    full: string
  }

  static fromUserPlayer(user: User, player: SteamPlayer): MeDto {
    const me = new MeDto()
    me._id = user._id
    me.name = {
      personal: player.personaname,
      real: player.realname,
    }
    me.avatar = {
      small: player.avatar,
      medium: player.avatarmedium,
      full: player.avatarfull,
    }
    return me
  }
}
