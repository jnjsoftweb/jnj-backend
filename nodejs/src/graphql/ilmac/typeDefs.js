import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type SettingsList {
    orgName: String!
    url: String
    iframe: String
    rowXpath: String
    paging: String
    startPage: Int
    endPage: Int
    login: String
    title: String
    detailUrl: String
    writeDate: String
    writer: String
    excludeKeywords: String
    use: Boolean
    region: String
    registered: Int
  }

  input SettingsListInput {
    orgName: String!
    url: String
    iframe: String
    rowXpath: String
    paging: String
    startPage: Int
    endPage: Int
    login: String
    title: String
    detailUrl: String
    writeDate: String
    writer: String
    excludeKeywords: String
    use: Boolean
    region: String
    registered: Int
  }

  type Query {
    getAllSettings: [SettingsList]
    getSettingsByOrg(orgName: String!): SettingsList
    getSettingsByRegion(region: String!): [SettingsList]
    getAllNotices: [Notice]
    getNoticeById(nid: Int!): Notice
    getNoticesByOrg(orgName: String!): [Notice]
    getNoticesByDateRange(startDate: String!, endDate: String!): [Notice]
    getAllKeywords: [SettingsKeyword]
    getKeywordByName(searchName: String!): SettingsKeyword
    getKeywordsByCategory(category: String!): [SettingsKeyword]
    getKeywordsByOrg(targetOrg: String!): [SettingsKeyword]
    getKeywordsByRegion(targetRegion: String!): [SettingsKeyword]
  }

  type Mutation {
    createSettings(input: SettingsListInput!): SettingsList
    updateSettings(orgName: String!, input: SettingsListInput!): SettingsList
    deleteSettings(orgName: String!): Boolean
    toggleUseSettings(orgName: String!, use: Boolean!): SettingsList
    createNotice(input: NoticeInput!): Notice
    updateNotice(nid: Int!, input: NoticeInput!): Notice
    deleteNotice(nid: Int!): Boolean
    deleteNoticesByOrg(orgName: String!): Int
    createKeyword(input: SettingsKeywordInput!): SettingsKeyword
    updateKeyword(searchName: String!, input: SettingsKeywordInput!): SettingsKeyword
    deleteKeyword(searchName: String!): Boolean
    toggleKeywordUse(searchName: String!, use: Boolean!): SettingsKeyword
  }

  type Notice {
    nid: Int!
    sn: Int!
    orgName: String!
    title: String
    detailUrl: String
    writeDate: String
    writer: String
    scrapedAt: String
    createdAt: String!
    updatedAt: String!
  }

  input NoticeInput {
    sn: Int!
    orgName: String!
    title: String
    detailUrl: String
    writeDate: String
    writer: String
    scrapedAt: String
  }

  type SettingsKeyword {
    use: Boolean
    searchName: String!
    searchKeywords: String
    excludeKeywords: String
    minScore: Int
    category: String
    targetOrg: String
    targetRegion: String
    writer: String
    memo: String
    createdAt: String!
    updatedAt: String!
  }

  input SettingsKeywordInput {
    use: Boolean
    searchName: String!
    searchKeywords: String
    excludeKeywords: String
    minScore: Int
    category: String
    targetOrg: String
    targetRegion: String
    writer: String
    memo: String
  }
`;
