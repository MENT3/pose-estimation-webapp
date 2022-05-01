import 'fs'
import * as tfnode from '@tensorflow/tfjs-node'
import Drive from '@ioc:Adonis/Core/Drive'
import * as posenet from '@tensorflow-models/posenet'

import { createCanvas, loadImage } from 'canvas'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadsController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({ request, view }: HttpContextContract) {
    const requestImage = request.file('image')

    await requestImage!.moveToDisk('./')

    const filePath = requestImage!.filePath

    const tfImage = tfnode.node.decodeJpeg(await Drive.get(filePath!))

    const poseNetModel = await posenet.load()
    const prediction = await poseNetModel.estimateSinglePose(tfImage)

    const [imageHeight, imageWidth] = tfImage.shape

    const canvas = createCanvas(imageWidth, imageHeight)
    const ctx = canvas.getContext('2d')

    // Draw image to canvas
    const loadedImage = await loadImage(filePath!)
    ctx.drawImage(loadedImage, 0, 0)

    // Draw prediction on image
    for (const keypoint of prediction.keypoints) {
      ctx.beginPath()
      ctx.arc(keypoint.position.x, keypoint.position.y, 2.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#52ecdc'
      ctx.fill()
    }

    return view.render('prediction', {
      image: canvas.toDataURL(),
    })
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
