import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar JSON

  # 색상 관련 enum 추가
  enum Color {
    default
    gray
    brown
    orange
    yellow
    green
    blue
    purple
    pink
    red
    gray_background
    brown_background
    orange_background
    yellow_background
    green_background
    blue_background
    purple_background
    pink_background
    red_background
  }

  # 코드 언어 enum 추가
  enum Language {
    abap
    arduino
    bash
    basic
    c
    clojure
    coffeescript
    cpp
    csharp
    css
    dart
    diff
    docker
    elixir
    elm
    erlang
    flow
    fortran
    fsharp
    gherkin
    glsl
    go
    graphql
    groovy
    haskell
    html
    java
    javascript
    json
    julia
    kotlin
    latex
    less
    lisp
    livescript
    lua
    makefile
    markdown
    markup
    matlab
    mermaid
    nix
    objective_c
    ocaml
    pascal
    perl
    php
    plain_text
    powershell
    prolog
    protobuf
    python
    r
    reason
    ruby
    rust
    sass
    scala
    scheme
    scss
    shell
    sql
    swift
    typescript
    vb_net
    verilog
    vhdl
    visual_basic
    webassembly
    xml
    yaml
  }

  type Page {
    id: String!
    created_time: String!
    last_edited_time: String!
    archived: Boolean!
    properties: JSON
    parent: Parent
    url: String
  }

  type Database {
    id: String!
    title: [RichText]!
    properties: JSON
    parent: Parent
    url: String
  }

  type Block {
    id: String!
    type: String!
    created_time: String!
    last_edited_time: String!
    archived: Boolean!
    has_children: Boolean!
    parent: Parent
    content: BlockContent
  }

  type Parent {
    type: String!
    page_id: String
    database_id: String
    workspace: Boolean
  }

  type RichText {
    type: String!
    text: TextContent
    annotations: Annotations
    plain_text: String!
    href: String
  }

  type TextContent {
    content: String!
    link: Link
  }

  type Link {
    url: String!
  }

  type Annotations {
    bold: Boolean!
    italic: Boolean!
    strikethrough: Boolean!
    underline: Boolean!
    code: Boolean!
    color: String!
  }

  type FileObject {
    url: String!
    expiry_time: String
  }

  type ExternalFile {
    url: String!
  }

  type Icon {
    type: String!
    emoji: String
    file: FileObject
  }

  type SyncedFrom {
    block_id: String
  }

  # Block 타입들
  type Bookmark {
    caption: [RichText]
    url: String!
  }

  type Breadcrumb {
    type: String!
  }

  type BulletedListItem {
    rich_text: [RichText]!
    color: String!
    children: [Block]
  }

  type Callout {
    rich_text: [RichText]!
    icon: Icon
    color: String!
  }

  type ChildDatabase {
    title: String!
  }

  type ChildPage {
    title: String!
  }

  type Code {
    caption: [RichText]
    rich_text: [RichText]!
    language: String!
  }

  type ColumnList {
    children: [Column]
  }

  type Column {
    children: [Block]
  }

  type Divider {
    type: String!
  }

  type Embed {
    url: String!
  }

  type Equation {
    expression: String!
  }

  type File {
    type: String!
    caption: [RichText]
    file: FileObject
    external: ExternalFile
  }

  type Heading1 {
    rich_text: [RichText]!
    color: String!
    is_toggleable: Boolean!
  }

  type Heading2 {
    rich_text: [RichText]!
    color: String!
    is_toggleable: Boolean!
  }

  type Heading3 {
    rich_text: [RichText]!
    color: String!
    is_toggleable: Boolean!
  }

  type Image {
    caption: [RichText]
    type: String!
    file: FileObject
    external: ExternalFile
  }

  type LinkPreview {
    url: String!
  }

  type Paragraph {
    rich_text: [RichText]!
    color: String!
    children: [Block]
  }

  type Pdf {
    type: String!
    caption: [RichText]
    file: FileObject
    external: ExternalFile
  }

  type Quote {
    rich_text: [RichText]!
    color: String!
    children: [Block]
  }

  type SyncedBlock {
    synced_from: SyncedFrom
    children: [Block]
  }

  type Table {
    table_width: Int!
    has_column_header: Boolean!
    has_row_header: Boolean!
    children: [TableRow]
  }

  type TableRow {
    cells: [[RichText]]!
  }

  type TableOfContents {
    color: String!
  }

  type ToDo {
    rich_text: [RichText]!
    checked: Boolean
    color: String!
    children: [Block]
  }

  type Toggle {
    rich_text: [RichText]!
    color: String!
    children: [Block]
  }

  type Video {
    type: String!
    caption: [RichText]
    file: FileObject
    external: ExternalFile
  }

  type NumberedListItem {
    rich_text: [RichText]!
    color: String!
    children: [Block]
  }

  type Template {
    rich_text: [RichText]!
    children: [Block]
  }

  type LinkToPage {
    type: String!
    page_id: String
    database_id: String
  }

  type Audio {
    type: String!
    caption: [RichText]
    file: FileObject
    external: ExternalFile
  }

  # Block 유니온 타입 정의
  union BlockContent = 
    Bookmark | 
    Breadcrumb | 
    BulletedListItem | 
    Callout | 
    ChildDatabase | 
    ChildPage | 
    Code | 
    ColumnList | 
    Column | 
    Divider | 
    Embed | 
    Equation | 
    File | 
    Heading1 | 
    Heading2 | 
    Heading3 | 
    Image | 
    LinkPreview | 
    Paragraph | 
    Pdf | 
    Quote | 
    SyncedBlock | 
    Table | 
    TableOfContents | 
    ToDo | 
    Toggle | 
    Video |
    NumberedListItem |
    Template |
    LinkToPage |
    Audio

  type Query {
    notionGetPage(id: String!): Page
    notionGetDatabase(id: String!): Database
    notionGetBlock(id: String!): Block
    notionQueryDatabase(database_id: String!, filter: JSON, sorts: [JSON]): [Page]
  }
`;
