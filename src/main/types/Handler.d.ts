import type { Request, Response } from 'express'

interface BaseHandler {
  id: string
  metadata: HandlerMetadata
}

export interface HandlerMetadata {
  name: string
  description: string
  icon: string
}

type HandlerWithoutActions = BaseHandler & {
  hasActions: false
  handle: HandlerFunction
}

type HandlerWithActions = BaseHandler & {
  hasActions: true
  actions: HandlerAction[]
  handle?: HandlerFunction
}

interface HandlerAction {
  action: string
  handle: HandlerFunction
}

type HandlerFunction = (req: Request, res: Response) => Promise<void>

export type Handler = HandlerWithoutActions | HandlerWithActions
