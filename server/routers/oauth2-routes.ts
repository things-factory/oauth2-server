import Router from 'koa-router'
import { jwtAuthenticateMiddleware } from '@things-factory/auth-base'
import { server as oauth2orizeServer } from '../oauth2'
import { getRepository } from 'typeorm'
import { Application, AuthToken, AuthTokenType } from '../entities'

export const oauth2Router = new Router()

// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.
oauth2Router.get(
  '/admin/oauth/authorize',
  jwtAuthenticateMiddleware,
  oauth2orizeServer.authorize(async function (clientID, redirectURI) {
    const repository = getRepository(Application)

    try {
      const client = await repository.findOne({
        appKey: clientID
      })
      // CONFIRM-ME redirectUrl 의 허용 범위는 ?
      // if (!client.redirectUrl != redirectURI) {
      //   return false
      // }

      // return [client, client.redirectUrl]
      return [client, redirectURI]
    } catch (e) {
      return false
    }
  }),
  async function (context, next) {
    const { oauth2, user } = context.state

    await context.render('oauth-page', {
      pageElement: 'oauth-decision',
      elementScript: '/oauth-decision.js',
      data: {
        transactionID: oauth2.transactionID,
        user, // TODO confirm
        client: oauth2.client
      }
    })
  }
)

// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

oauth2Router.post('/admin/oauth/decision', jwtAuthenticateMiddleware, oauth2orizeServer.decision)

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

oauth2Router.post(
  '/admin/oauth/access_token',
  jwtAuthenticateMiddleware,
  oauth2orizeServer.token,
  oauth2orizeServer.errorHandler
)

// static pages
oauth2Router.get('/oauth-dialog', async (context, next) => {
  await context.render('auth-page', {
    pageElement: 'oauth-dialog',
    elementScript: '/oauth-dialog.js',
    data: {}
  })
})