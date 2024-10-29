# Notion GraphQL API Specification

## Overview
Notion API를 GraphQL로 래핑한 스펙입니다.

## Types

### Page
- id: String!
- created_time: String!
- last_edited_time: String!
- archived: Boolean!
- properties: JSON
- parent: Parent
- url: String

### Database
- id: String!
- title: [RichText]!
- properties: JSON
- parent: Parent
- url: String

### Block
- id: String!
- type: String!
- created_time: String!
- last_edited_time: String!
- archived: Boolean!
- has_children: Boolean!
- parent: Parent

### Parent
- type: String!
- page_id: String
- database_id: String
- workspace: Boolean

### RichText
- type: String!
- text: TextContent
- annotations: Annotations
- plain_text: String!
- href: String

### TextContent
- content: String!
- link: Link

### Link
- url: String!

### Annotations
- bold: Boolean!
- italic: Boolean!
- strikethrough: Boolean!
- underline: Boolean!
- code: Boolean!
- color: String!

## Queries
- notionGetPage(id: String!): Page
- notionGetDatabase(id: String!): Database
- notionGetBlock(id: String!): Block
- notionQueryDatabase(database_id: String!, filter: JSON, sorts: [JSON]): [Page]
