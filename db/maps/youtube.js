const mapCollectons = {
    users: "youtubeUsers",
    subscriptions: "youtubeSubscriptions",
    channels: "youtubeChannels",
    playlists: "youtubePlaylists",
    videos: "youtubeVideos"
}

const mapFields = {
    users: [
        {id: "userId"}
    ],
    subscriptions: [
        {id: "subscriptionId"}
    ],
    channels: [
        {id: "channelId"}
    ],
    playlists: [
        {id: "playlistId"}
    ],
    videos: [
        {id: "videoId"}
    ]
};

const convColName = (typeName) => {
    return mapCollectons[typeName];
}

const convDbField = (colName, key) => {
    return mapFields[colName].find((f) => f[key])[key];
}

const convToDbData = (colName, data) => {
    return mapFields[colName].map((field) => ({
        ...field,
        ...data[field.id]
    }));
}
  
export { mapCollectons, mapFields, convToField };


// console.log(convToDbField('users', 'id'));