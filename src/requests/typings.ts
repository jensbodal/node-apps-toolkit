// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/
import * as runtypes from 'runtypes'

export const enum ContentfulHeader {
  Timestamp = 'x-contentful-timestamp',
  SignedHeaders = 'x-contentful-signed-headers',
  Signature = 'x-contentful-signature',
}

export const enum ContentfulContextHeader {
  SpaceId = 'x-contentful-space-id',
  EnvironmentId = 'x-contentful-environment-id',
  UserId = 'x-contentful-user-id',
  AppId = 'x-contentful-app-id',
}

const MethodValidator = runtypes.Union(
  runtypes.Literal('GET'),
  runtypes.Literal('PATCH'),
  runtypes.Literal('HEAD'),
  runtypes.Literal('POST'),
  runtypes.Literal('DELETE'),
  runtypes.Literal('OPTIONS'),
  runtypes.Literal('PUT')
)

const PathValidator = runtypes.String.withConstraint((s) => s.startsWith('/'), {
  name: 'CanonicalURI',
})

const SignatureValidator = runtypes.String.withConstraint((s) => s.length === 64, {
  name: 'SignatureLength',
})

export const CanonicalRequestValidator = runtypes
  .Record({
    method: MethodValidator,
    path: PathValidator,
  })
  .And(
    runtypes.Partial({
      headers: runtypes.Dictionary(runtypes.String, 'string'),
      body: runtypes.String,
    })
  )
export type CanonicalRequest = runtypes.Static<typeof CanonicalRequestValidator>

export const SecretValidator = runtypes.String.withConstraint((s) => s.length === 64, {
  name: 'SecretLength',
})
export type Secret = runtypes.Static<typeof SecretValidator>

// Only dates after 01-01-2020
export const TimestampValidator = runtypes.Number.withConstraint((n) => n > 1577836800000, {
  name: 'TimestampAge',
})
export type Timestamp = runtypes.Static<typeof TimestampValidator>

const SignedHeadersValidator = runtypes
  .Array(runtypes.String)
  .withConstraint((l) => l.length >= 2, { name: 'MissingTimestampOrSignedHeaders' })

export const RequestMetadataValidator = runtypes.Record({
  signature: SignatureValidator,
  timestamp: TimestampValidator,
  signedHeaders: SignedHeadersValidator,
})
export type RequestMetadata = runtypes.Static<typeof RequestMetadataValidator>

export const TimeToLiveValidator = runtypes.Number.withConstraint((n) => n >= 0, {
  name: 'PositiveNumber',
})
export type TimeToLive = runtypes.Static<typeof TimeToLiveValidator>

export type NormalizedCanonicalRequest = {
  method: CanonicalRequest['method']
  path: CanonicalRequest['path']
  headers: [key: string, value: string][]
  body: CanonicalRequest['body']
}

export type SubjectHeadersApp = { appId: string }
export type AppContextSignedHeaders = { [ContentfulContextHeader.AppId]: string }
export type SubjectHeadersUser = { userId: string }
export type UserContextSignedHeaders = { [ContentfulContextHeader.UserId]: string }

export type Context<SubjectContext> = {
  spaceId: string
  envId: string
} & SubjectContext

type SignedHeadersWithoutSubject = {
  [ContentfulContextHeader.SpaceId]: string
  [ContentfulContextHeader.EnvironmentId]: string
}

export type SignedContextHeaders<SubjectSignedHeaders> = SignedHeadersWithoutSubject &
  SubjectSignedHeaders

export type SignedRequestWithoutContextHeaders = {
  [key in ContentfulHeader]: string
}
export type SignedRequestWithContextHeadersWithUser = SignedRequestWithoutContextHeaders &
  SignedContextHeaders<UserContextSignedHeaders>
export type SignedRequestWithContextHeadersWithApp = SignedRequestWithoutContextHeaders &
  SignedContextHeaders<AppContextSignedHeaders>

export type SignedRequestHeaders =
  | SignedRequestWithContextHeadersWithUser
  | SignedRequestWithContextHeadersWithApp
  | SignedRequestWithoutContextHeaders
