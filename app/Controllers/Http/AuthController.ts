import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RegisterValidator from 'App/Validators/Auth/RegisterValidator'

export default class AuthController {
  public async register({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterValidator)

    await User.create(payload)

    await auth.use('web').attempt(payload.email, payload.password)

    return response.redirect().toPath('/')
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    try {
      await auth.use('web').attempt(email, password)
      return response.redirect().toPath('/')
    } catch {
      return response.badRequest('Invalid credentials')
    }
  }
}
